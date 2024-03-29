/// <reference types="../../../types/gatsby" />
/// <reference types="jest" />

import { PatchedPluginOptions } from 'gatsby';
import { FixedObject, FluidObject } from 'gatsby-image';
import {
  buildEnumType,
  buildInputObjectType,
  buildObjectType,
} from 'gatsby/dist/schema/types/type-builders';
import isBase64 from 'is-base64';
import * as R from 'ramda';
import { KeyValuePair, pipe } from 'ramda';
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

    testForEveryFieldSrcAndSrcSet({
      name: 'integer and float parameters are set correctly',
      resolveFieldOpts: {
        fieldParams: {
          imgixParams: {
            blendH: 0.5, // type has both unit_scalar and integer
            blendW: 10, // type has both unit_scalar and integer
            txtSize: 1, // type is integer only
            fpY: 0.5, // type is unit_scalar only
          },
        },
      },
      assertion: (url) => {
        expect(url).toMatch('blend-h=0.5');
        expect(url).toMatch('blend-w=10');
        expect(url).toMatch('txt-size=1');
        expect(url).toMatch('fp-y=0.5');
      },
    });
    test(`integer and float parameters are set correctly`, async () => {
      const result = await resolveField({
        field: 'gatsbyImageData',
        url: 'amsterdam.jpg',
        fieldParams: {
          imgixParams: {
            blendH: 0.5, // type has both unit_scalar and integer
            blendW: 10, // type has both unit_scalar and integer
            txtSize: 1, // type is integer only
            fpY: 0.5, // type is unit_scalar only
          },
        },
      });

      const url = result.images.fallback.src;
      expect(url).toMatch('blend-h=0.5');
      expect(url).toMatch('blend-w=10');
      expect(url).toMatch('txt-size=1');
      expect(url).toMatch('fp-y=0.5');
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

        // Don't need to do too much work here since @imgix/js-core handles everything under the hood
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
        const getType = resolveResult.typeStore.getType;

        // Need to resolve base64 again
        const rootType = resolveResult.objectTypeConfig;
        const imgixImageType = getType(rootType.config.fields.imgixImage.type);
        const fluidType = getType(imgixImageType.config.fields.fluid.type);
        const base64Field = fluidType.config.fields.base64;
        const base64ResolvedValue = await base64Field?.resolve(
          resolveResult.fieldResult,
          {},
        );

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

        // Don't need to do too much work here since @imgix/js-core handles everything under the hood
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

        // Don't need to do too much work here since @imgix/js-core handles everything under the hood
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
          const srcsetWidths = getSrcsetWidths(srcset);
          srcsetWidths.forEach((width) => {
            expect(width).toBeLessThanOrEqual(maxWidth);
          });
        };

        // Don't need to do too much work here since @imgix/js-core handles everything under the hood
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
      assertion: (url) => expect(url).toMatch('ixlib=gatsbySourceUrl'),
    });
    testForEveryFieldSrcAndSrcSet({
      name: 'should not exist in src when disableIxlibParam is set',
      resolveFieldOpts: {
        appConfig: {
          disableIxlibParam: true,
        },
      },
      assertion: (url) => expect(url).not.toMatch('ixlib='),
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
        getTypeStoreFromSchemaCustomization({
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
  describe('gatsbyImageData field', () => {
    it('should set blurred placeholder data correctly', async () => {
      const result = await resolveField({
        field: 'gatsbyImageData',
        url: 'amsterdam.jpg',
        fieldParams: {
          placeholder: 'blurred',
        },
      });

      expect(isBase64(result.placeholder.fallback, { allowMime: true })).toBe(
        true,
      );
      expect(result).toMatchObject({
        placeholder: { fallback: expect.stringMatching('data:image/') },
      });
    });
    it('should set background colour placeholder data correctly', async () => {
      const result = await resolveField({
        field: 'gatsbyImageData',
        url: 'amsterdam.jpg',
        fieldParams: {
          placeholder: 'dominantColor',
        },
      });

      expect(result.backgroundColor).toMatch(/^#([0-9A-F]{3}){1,2}$/i);
    });

    // TODO[A]: Disabling this test for now as it's brittle
    it.skip('should be able to set custom placeholder parameters in placeholderImgixParams', async () => {
      const result = await resolveField({
        field: 'gatsbyImageData',
        url: 'amsterdam.jpg',
        fieldParams: {
          placeholder: 'dominantColor',
          placeholderImgixParams: {
            hue: 180,
          },
        },
      });

      // Bit flaky here to hard code a colour value, but I wanted to make sure that it was different to the above test
      expect(result.backgroundColor).toMatch('#348ff2');
    });

    it('should override w and h from imgixParams argument', async () => {
      const imgixParams = { w: 2, h: 1 };
      const result = await resolveField({
        field: 'gatsbyImageData',
        url: 'amsterdam.jpg',
        fieldParams: {
          imgixParams,
        },
      });
      const src = new URL(result.images.fallback.src);

      expect(src.searchParams.get('w')).not.toBe(imgixParams.w.toString());
      expect(src.searchParams.get('h')).not.toBe(imgixParams.h.toString());
    });
  });
  it('should accept string path for rawURLKey', async () => {
    const result = await getTypeStoreFromSchemaCustomization({
      appConfig: {
        fields: [
          {
            nodeType: 'ImgixImageTest',
            fieldName: 'imgixImage',
            rawURLKey: 'nested.nonImgixUrl',
          },
        ],
      },
    });

    const ImgixImageTestType = result.getType('ImgixImageTest');
    const resolver = ImgixImageTestType.config.fields.imgixImage.resolve;
    const node = {
      nested: { nonImgixUrl: 'https://test.imgix.net/image.jpg' },
    };
    const resolved = resolver(node, {});

    expect(resolved.rawURL).toEqual(node.nested.nonImgixUrl);
  });
  it('should accept string paths for rawURLKey', async () => {
    const result = await getTypeStoreFromSchemaCustomization({
      appConfig: {
        fields: [
          {
            nodeType: 'ImgixImageTest',
            fieldName: 'imgixImage',
            rawURLKeys: ['nested.nonImgixUrl', 'nested.nonImgixUrl2'],
          },
        ],
      },
    });

    const ImgixImageTestType = result.getType('ImgixImageTest');
    const resolver = ImgixImageTestType.config.fields.imgixImage.resolve;
    const node = {
      nested: {
        nonImgixUrl: 'https://test.imgix.net/image.jpg',
        nonImgixUrl2: 'https://test.imgix.net/image.jpg',
      },
    };
    const resolved = resolver(node, {});

    expect(resolved.rawURL).toEqual([
      node.nested.nonImgixUrl,
      node.nested.nonImgixUrl2,
    ]);
  });

  it('should add URLPrefix to single URL retrieved from node', async () => {
    const result = await getTypeStoreFromSchemaCustomization({
      appConfig: {
        fields: [
          {
            nodeType: 'ImgixImageTest',
            fieldName: 'imgixImage',
            rawURLKey: 'nested.nonImgixUrl',
            URLPrefix: 'https:',
          },
        ],
      },
    });

    const ImgixImageTestType = result.getType('ImgixImageTest');
    const resolver = ImgixImageTestType.config.fields.imgixImage.resolve;
    const node = {
      nested: { nonImgixUrl: '//test.imgix.net/image.jpg' },
    };
    const resolved = resolver(node, {});

    expect(resolved.rawURL).toEqual('https:' + node.nested.nonImgixUrl);
  });
  it('should accept string paths for rawURLKey', async () => {
    const result = await getTypeStoreFromSchemaCustomization({
      appConfig: {
        fields: [
          {
            nodeType: 'ImgixImageTest',
            fieldName: 'imgixImage',
            rawURLKeys: ['nested.nonImgixUrl', 'nested.nonImgixUrl2'],
            URLPrefix: 'https:',
          },
        ],
      },
    });

    const ImgixImageTestType = result.getType('ImgixImageTest');
    const resolver = ImgixImageTestType.config.fields.imgixImage.resolve;
    const node = {
      nested: {
        nonImgixUrl: '//test.imgix.net/image.jpg',
        nonImgixUrl2: '//test.imgix.net/image.jpg',
      },
    };
    const resolved = resolver(node, {});

    expect(resolved.rawURL).toEqual([
      'https:' + node.nested.nonImgixUrl,
      'https:' + node.nested.nonImgixUrl2,
    ]);
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

type FieldType = 'url' | 'fluid' | 'fixed' | 'gatsbyImageData';

const resolveField = async ({
  appConfig,
  field,
  fieldParams = {},
  url,
}: {
  appConfig?: Parameters<typeof resolveFieldInternal>[0]['appConfig'];
  field: FieldType;
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
    typeof getTypeStoreFromSchemaCustomization
  >[0]['appConfig'];
  field: FieldType;
  fieldParams?: Object;
  url?: string;
}) {
  const typeStore = await getTypeStoreFromSchemaCustomization({
    appConfig,
  });

  const queryConfig = typeStore.getType('Query');

  const fieldParamsWithDefaults = createFieldParamsWithDefaults({
    objectTypeConfig: queryConfig,
    field,
    fieldParams,
    getType: typeStore.getType,
  });

  // Get root value from the root imgixImage resolver. This is passed to child resolvers.
  const imgixImageRootValue = queryConfig.config.fields.imgixImage?.resolve?.(
    {},
    { url },
  );

  // Resolve the field specified in the imgixImage type
  const imgixImageFieldConfig = typeStore.getType(
    queryConfig.config.fields.imgixImage.type,
  );
  const targetFieldConfig = imgixImageFieldConfig.config.fields[field];
  const fieldResolver =
    typeof targetFieldConfig === 'string'
      ? typeStore.getType(targetFieldConfig)
      : targetFieldConfig.resolve;
  const fieldResult = await fieldResolver(
    imgixImageRootValue,
    fieldParamsWithDefaults,
  );
  return { fieldResult, objectTypeConfig: queryConfig, typeStore };
}

function createFieldParamsWithDefaults({
  objectTypeConfig,
  field,
  fieldParams,
  getType,
}: {
  objectTypeConfig: ObjectTypeConfig;
  field: FieldType;
  fieldParams: FieldParams;
  getType: (name: string) => any;
}) {
  const defaultParamsForField = pipe(
    () =>
      getType(objectTypeConfig.config.fields.imgixImage.type).config.fields[
        field
      ].args ?? {},
    Object.entries,
    R.chain(([key, config]: [string, any]): KeyValuePair<string, any>[] =>
      config.defaultValue ? [[key, config.defaultValue]] : [],
    ),
    (v) => R.fromPairs(v),
  )();
  return {
    ...defaultParamsForField,
    ...fieldParams,
  };
}

const defaultAppConfig = {
  domain: 'assets.imgix.net',
  plugins: [],
} as const;

async function getTypeStoreFromSchemaCustomization({
  appConfig: _appConfig,
}: {
  appConfig?: Partial<PatchedPluginOptions<IImgixGatsbyOptions>>;
}): Promise<{ getType: (name: string) => any }> {
  const appConfig = R.mergeDeepRight(
    defaultAppConfig,
    _appConfig ?? {},
  ) as PatchedPluginOptions<IImgixGatsbyOptions>;

  const typeStore = {} as any;

  type TypeWithName = { config: { name: string } };
  const mockCreateTypesFn = (types: TypeWithName | TypeWithName[]) => {
    (Array.isArray(types) ? types : [types]).map(
      (type) => (typeStore[type.config.name] = type),
    );
  };

  const gatsbyContext = {
    cache: mockGatsbyCache,
    reporter: createMockReporter(),
    actions: {
      createTypes: mockCreateTypesFn,
    },
    schema: {
      buildObjectType: buildObjectType,
      buildEnumType: buildEnumType,
      buildInputObjectType: buildInputObjectType,
    },
  } as any;

  createSchemaCustomization &&
    (await createSchemaCustomization(gatsbyContext, appConfig));

  return {
    getType: (name: string) => typeStore[name],
  };
}

type ObjectTypeConfig = {
  kind: 'OBJECT';
  config: {
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
};
