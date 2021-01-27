/// <reference types="../../../types/gatsby" />
/// <reference types="jest" />

import { pipe } from 'fp-ts/lib/function';
import { PatchedPluginOptions } from 'gatsby';
import { FixedObject, FluidObject } from 'gatsby-image';
import * as R from 'ramda';
import { createLogger, trace } from '../../../src/common/log';
import { createSchemaCustomization } from '../../../src/gatsby-node';
import { IImgixGatsbyOptions, ImgixSourceType } from '../../../src/publicTypes';
import { getSrcsetWidths } from '../../common/getSrcsetWidths';
import { createMockReporter } from '../../common/mocks';

const log = createLogger('test:createResolvers');

const testForEveryFieldSrcAndSrcSet = ({
  name,
  resolveFieldOpts,
  assertion,
}: {
  name: string;
  resolveFieldOpts?: Partial<Parameters<typeof resolveField>[0]>;
  assertion: (url: string) => void;
}) => {
  it(`${name} for url field`, async () => {
    const urlFieldResult = await resolveField({
      field: 'url',
      ...resolveFieldOpts,
    });

    assertion(urlFieldResult);
  });
  it(`${name} for fluid field`, async () => {
    const fieldResult = await resolveField({
      field: 'fluid',
      ...resolveFieldOpts,
    });

    assertion(fieldResult.src);
    assertion(fieldResult.srcSet);
    assertion(fieldResult.srcWebp);
    assertion(fieldResult.srcSetWebp);
  });
  it(`${name} for fixed field`, async () => {
    const fieldResult = await resolveField({
      field: 'fixed',
      ...resolveFieldOpts,
    });

    assertion(fieldResult.src);
    assertion(fieldResult.srcSet);
    assertion(fieldResult.srcWebp);
    assertion(fieldResult.srcSetWebp);
  });
};

describe('createResolvers', () => {
  describe('valid src', () => {
    testForEveryFieldSrcAndSrcSet({
      name: 'should return a valid src',
      resolveFieldOpts: {
        url: 'amsterdam.jpg',
        appConfig: {
          domain: 'assets.imgix.net',
        },
      },
      assertion: (url) =>
        expect(url).toMatch(/^https:\/\/assets.imgix.net\/amsterdam.jpg/),
    });
    testForEveryFieldSrcAndSrcSet({
      name: 'should apply an imgixParam',
      resolveFieldOpts: {
        fieldParams: {
          imgixParams: { txt: 'txt' },
        },
      },
      assertion: (url) => expect(url).toMatch(/txt=txt/),
    });
  });
  describe('url field', () => {
    it('applies imgixParams correctly', async () => {
      const urlFieldResult = await resolveField({
        field: 'url',
        fieldParams: { imgixParams: { w: 10 } },
      });

      expect(urlFieldResult).toMatch('w=10');
    });
  });

  describe('fluid field', () => {
    describe('src field', () => {
      it('should generate a fluid width srcset', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
        });

        // Don't need to do too much work here since imgix-core-js handles everything under the hood
        expect(fluidFieldResult.srcSet).toMatch(/\d*w,/);
        expect(fluidFieldResult.srcSetWebp).toMatch(/\d*w,/);
      });
    });

    describe('aspectRatio field', () => {
      it('should be set based on the aspect ratio of the source image', async () => {
        // These values can be obtained from the "PixelWidth" and "PixelHeight" values from https://assets.imgix.net/amsterdam.jpg?fm=json

        const sourceImageWidth = 2000;
        const sourceImageHeight = 1250;
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
        });

        expect(fluidFieldResult.aspectRatio).toBe(
          sourceImageWidth / sourceImageHeight,
        );
      });

      it('should be set to the value of the ar param, when set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: {
            imgixParams: { ar: '2:1' },
          },
        });

        expect(fluidFieldResult.aspectRatio).toBe(2);
      });
    });

    describe('base64 field', () => {
      it('should set a valid base64 image', async () => {
        const resolveResult = await resolveFieldInternal({
          field: 'fluid',
          fieldParams: {
            imgixParams: { ar: '2:1' },
          },
        });

        // Need to resolve base64 again
        const base64ResolvedValue = await resolveResult.objectTypeConfig.fields.imgixImage.type
          .getFields()
          ['fluid'].type.getFields()
          ?.base64?.resolve(resolveResult.fieldResult, {});

        expect(base64ResolvedValue).toMatch(/^data:image\/jpeg;base64,.*\//);
      });

      it('should respond to placeholderParams', async () => {
        // We are resolving the fluid field here and not the base64 field so that we can just assert on the url.
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: {
            placeholderImgixParams: { w: 100 },
          },
        });

        expect(fluidFieldResult.base64).toMatch(/w=100/);
      });
    });
    describe('when setting maxWidth and maxHeight', () => {
      it('should set fit=crop by default to ensure image is cropped', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: {},
        });

        expect(fluidFieldResult.src).toMatch('fit=crop');
        expect(fluidFieldResult.srcWebp).toMatch('fit=crop');
        expect(fluidFieldResult.srcSet).toMatch('fit=crop');
        expect(fluidFieldResult.srcSetWebp).toMatch('fit=crop');
      });
      it('should return original image aspect ratio and not set ar in srcs when neither maxWidth nor maxHeight set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
        });

        // Don't need to do too much work here since imgix-core-js handles everything under the hood
        expect(fluidFieldResult.src).not.toMatch('ar=');
        expect(fluidFieldResult.srcWebp).not.toMatch('ar=');
        expect(fluidFieldResult.srcSet).not.toMatch('ar=');
        expect(fluidFieldResult.srcSetWebp).not.toMatch('ar=');
      });
      it('should set width on srcs when maxWidth set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxWidth: 500 },
        });

        // Don't need to do too much work here since imgix-core-js handles everything under the hood
        expect(fluidFieldResult.src).toMatch('w=500');
        expect(fluidFieldResult.srcWebp).toMatch('w=500');
      });
      it('should cap srcset widths when maxWidth set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxWidth: 500 },
        });

        const expectSrcsetToNotHaveWidthsGT = (maxWidth: number) => (
          srcset: string | undefined,
        ) => {
          if (srcset == null) {
            fail();
          }
          pipe(srcset, getSrcsetWidths, R.all(R.lte(R.__, maxWidth)), (v) =>
            expect(v).toBe(true),
          );
        };

        // Don't need to do too much work here since imgix-core-js handles everything under the hood
        expectSrcsetToNotHaveWidthsGT(500)(fluidFieldResult.srcSet);
        expectSrcsetToNotHaveWidthsGT(500)(fluidFieldResult.srcSetWebp);
      });
      it('should set aspectRatio when maxHeight set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxHeight: 100 },
        });

        expect(fluidFieldResult.aspectRatio).toBe(81.92);
      });
      it('should set ar when maxHeight set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxHeight: 100 },
        });

        expect(fluidFieldResult.src).toMatch('ar=81.92%3A1');
        expect(fluidFieldResult.srcWebp).toMatch('ar=81.92%3A1');
        expect(fluidFieldResult.srcSet).toMatch('ar=81.92%3A1');
        expect(fluidFieldResult.srcSetWebp).toMatch('ar=81.92%3A1');
      });
      it('should set aspectRatio when maxWidth and maxHeight set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxHeight: 100, maxWidth: 200 },
        });

        expect(fluidFieldResult.aspectRatio).toBe(2);
      });
      it('should set ar when maxWidth and maxHeight set', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
          fieldParams: { maxHeight: 100, maxWidth: 200 },
        });

        expect(fluidFieldResult.src).toMatch('ar=2%3A1');
        expect(fluidFieldResult.srcWebp).toMatch('ar=2%3A1');
        expect(fluidFieldResult.srcSet).toMatch('ar=2%3A1');
        expect(fluidFieldResult.srcSetWebp).toMatch('ar=2%3A1');
      });
    });

    it('should create srcsets based off the breakpoints argument', async () => {
      const srcSetBreakpoints = [100, 200];
      const fluidFieldResult: FluidObject = await resolveField({
        field: 'fluid',
        fieldParams: {
          srcSetBreakpoints,
        },
      });

      const expectSrcsetToHaveWidths = (widths: number[]) => (
        srcset: string | undefined,
      ) => {
        if (srcset == null) {
          fail();
        }
        expect(getSrcsetWidths(srcset)).toEqual(srcSetBreakpoints);
      };

      const expectSrcSetToHaveBreakpoints = expectSrcsetToHaveWidths(
        srcSetBreakpoints,
      );

      expectSrcSetToHaveBreakpoints(fluidFieldResult.srcSet);
      expectSrcSetToHaveBreakpoints(fluidFieldResult.srcSetWebp);
    });
    it('should set fm=webp for webp src and srcset', async () => {
      const fluidFieldResult: FluidObject = await resolveField({
        field: 'fluid',
      });

      expect(fluidFieldResult.srcWebp).toMatch('fm=webp');
      expect(fluidFieldResult.srcSetWebp).toMatch('fm=webp');
    });
    it('should not set fm=webp for normal src and srcset', async () => {
      const fluidFieldResult: FluidObject = await resolveField({
        field: 'fluid',
      });

      expect(fluidFieldResult.src).not.toMatch('fm=webp');
      expect(fluidFieldResult.srcSet).not.toMatch('fm=webp');
    });
  });

  describe('fixed field', () => {
    describe('src field', () => {
      it('should generate a fixed width srcset', async () => {
        const fluidFieldResult: FixedObject = await resolveField({
          field: 'fixed',
        });

        expect(fluidFieldResult.srcSet).toMatch('1x');
        expect(fluidFieldResult.srcSetWebp).toMatch('1x');
      });
    });
  });

  describe('default parameters', () => {
    testForEveryFieldSrcAndSrcSet({
      name: 'should set default parameters',
      resolveFieldOpts: {
        appConfig: {
          defaultImgixParams: {
            txt: 'Default',
          },
        },
      },
      assertion: (url) => expect(url).toMatch('txt=Default'),
    });
    testForEveryFieldSrcAndSrcSet({
      name: 'should allow default parameters to be overridden',
      resolveFieldOpts: {
        appConfig: {
          defaultImgixParams: {
            txt: 'Default',
          },
        },
        fieldParams: {
          imgixParams: {
            txt: 'Overridden',
          },
        },
      },
      assertion: (url) => expect(url).toMatch('txt=Overridden'),
    });
  });

  describe('ixlib param', () => {
    testForEveryFieldSrcAndSrcSet({
      name: 'should be included in src by default',
      assertion: (url) => expect(url).toMatch('ixlib=gatsby-source-url'),
    });
    testForEveryFieldSrcAndSrcSet({
      name: 'should not exist in src when disableIxlibParam is set',
      resolveFieldOpts: {
        appConfig: {
          disableIxlibParam: true,
        },
      },
      assertion: (url) => expect(url).not.toMatch('ixlib=gatsby-source-url'),
    });
  });

  describe('secure urls', () => {
    testForEveryFieldSrcAndSrcSet({
      name: 'should apply a secure token if global param secureURLToken set',
      resolveFieldOpts: {
        appConfig: { secureURLToken: 'a-secure-token' },
      },
      assertion: (url) => expect(url).toMatch(/s=\w+/),
    });
  });

  describe.skip('web proxy sources', () => {
    it(`should throw an error if app is configured with sourceType: 'webProxy' but no secureURLToken`, async () => {
      const createResolversLazy = () =>
        getTypeResolverFromSchemaCustomization({
          modifyTargetTypeName: 'Query',
          appConfig: {
            sourceType: ImgixSourceType.WebProxy,
            domain: 'assets.imgix.net',
          },
        });

      expect(createResolversLazy).toThrow('secureURLToken');
    });

    const proxyUrl = 'https://assets.imgix.net/amsterdam.jpg';
    testForEveryFieldSrcAndSrcSet({
      name: `should encrypt path when sourceType set to 'webProxy'`,
      resolveFieldOpts: {
        appConfig: {
          domain: 'sdk-proxy-test.imgix.net',
          sourceType: ImgixSourceType.WebProxy,
          secureURLToken: process.env.PROXY_DEMO_TOKEN,
        },
        url: proxyUrl,
      },
      assertion: (url) => {
        return expect(url).toMatch(
          `https://sdk-proxy-test.imgix.net/${encodeURIComponent(proxyUrl)}?`,
        );
      },
    });
  });
});

const mockGatsbyCache = {
  store: {} as { [k: string]: any },
  async get(key: string) {
    trace(`Getting cache value for`, log)(key);
    return this.store[key];
  },
  async set(key: string, value: any) {
    trace(`Setting cache value for ${key} to ${value}`, log)(value);
    this.store[key] = value;
    return value;
  },
};

const resolveField = async ({
  appConfig,
  field,
  fieldParams = {},
  url,
}: {
  appConfig?: Parameters<typeof resolveFieldInternal>[0]['appConfig'];
  field: 'url' | 'fluid' | 'fixed';
  fieldParams?: Object;
  url?: string;
}) => {
  /* This is pretty convoluted test but I think it's better to test the whole thing e2e than just test the individual components and hope for the best.

  This test is equivalent to running a graphql query of
  {
    imgixImage(url: $url) {
      url(imgixParams: fieldParams.imgixParams)
    }
  }
  and asserting that the url field matches "test.imgix.net/image.jpg/"
  */

  // Call createSchemaCustomization and capture the result
  const resolveResult = await resolveFieldInternal({
    appConfig,
    field,
    fieldParams,
    url,
  });

  return resolveResult.fieldResult;
};

type FieldParams = Record<string, any>;

async function resolveFieldInternal({
  appConfig,
  field,
  fieldParams = {},
  url = 'amsterdam.jpg',
}: {
  appConfig?: Parameters<
    typeof getTypeResolverFromSchemaCustomization
  >[0]['appConfig'];
  field: 'url' | 'fluid' | 'fixed';
  fieldParams?: Object;
  url?: string;
}) {
  const objectTypeConfig = await getTypeResolverFromSchemaCustomization({
    appConfig,
    modifyTargetTypeName: 'Query',
  });

  const fieldParamsWithDefaults = createFieldParamsWithDefaults(
    objectTypeConfig,
    field,
    fieldParams,
  );

  // Get root value from the root imgixImage resolver. This is passed to child resolvers.
  const imgixImageRootValue = objectTypeConfig.fields.imgixImage?.resolve?.(
    {},
    { url },
  );

  // Resolve the field specified in the imgixImage type
  const fieldResult = await (objectTypeConfig.fields.imgixImage.type as any)
    .getFields()
    [field].resolve(imgixImageRootValue, fieldParamsWithDefaults);
  return { fieldResult, objectTypeConfig: objectTypeConfig };
}

function createFieldParamsWithDefaults(
  objectTypeConfig: ObjectTypeConfig,
  field: 'url' | 'fluid' | 'fixed',
  fieldParams: FieldParams,
) {
  const defaultParamsForField = pipe(
    R.chain(
      (v: any): [string, any][] =>
        v.defaultValue ? [[v.name, v.defaultValue]] : [],
      (objectTypeConfig.fields.imgixImage.type as any).getFields()[field]
        .args ?? [],
    ),
    (v) => R.fromPairs(v),
  );
  return {
    ...defaultParamsForField,
    ...fieldParams,
  };
}

const defaultAppConfig = {
  domain: 'assets.imgix.net',
  plugins: [],
} as const;

async function getTypeResolverFromSchemaCustomization({
  appConfig: _appConfig,
  modifyTargetTypeName,
}: {
  appConfig?: Partial<PatchedPluginOptions<IImgixGatsbyOptions>>;
  modifyTargetTypeName: string;
}): Promise<ObjectTypeConfig> {
  const appConfig = R.mergeDeepRight(
    defaultAppConfig,
    _appConfig ?? {},
  ) as PatchedPluginOptions<IImgixGatsbyOptions>;

  const mockCreateTypesFn = jest.fn();
  const buildObjectTypeFn = jest.fn((v) => v);

  const gatsbyContext = {
    cache: mockGatsbyCache,
    reporter: createMockReporter(),
    actions: {
      createTypes: mockCreateTypesFn,
    },
    schema: {
      buildObjectType: buildObjectTypeFn,
    },
  } as any;

  createSchemaCustomization &&
    (await createSchemaCustomization(gatsbyContext, appConfig));

  const createTypesCalls = mockCreateTypesFn.mock.calls;

  const filteredCall = createTypesCalls.find(
    (parameters) => parameters[0]?.name === modifyTargetTypeName,
  );

  if (filteredCall == null) {
    throw new Error('Could not find matching type call.');
  }

  return filteredCall[0];
}

type ObjectTypeConfig = {
  name: string;
  fields: Record<
    string,
    {
      type: any;
      resolve?: (source: unknown, args: Record<string, unknown>) => unknown;
      args?: Record<
        string,
        { type: unknown; description?: string; defaultValue?: unknown }
      >;
    }
  >;
};
