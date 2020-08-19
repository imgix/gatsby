/// <reference types="../types/gatsby" />
/// <reference types="jest" />

import { pipe } from 'fp-ts/lib/function';
import { CreateResolversArgsPatched, PluginOptions } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import * as R from 'ramda';
import { createLogger, trace } from '../src/common/log';
import { createResolvers } from '../src/gatsby-node';
import { IGatsbySourceUrlOptions } from '../src/publicTypes';

const log = createLogger('test:createResolvers');

describe('createResolvers', () => {
  describe('url field', () => {
    it('resolves with a src', async () => {
      const urlFieldResult = await resolveField({
        field: 'url',
      });

      expect(urlFieldResult).toMatch('assets.imgix.net/amsterdam.jpg');
    });
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
      it('should return return an imgix url in the src fields', async () => {
        const fluidFieldResult: FluidObject = await resolveField({
          field: 'fluid',
        });

        // Don't need to do too much work here since imgix-core-js handles everything under the hood
        expect(fluidFieldResult.src).toMatch('ixlib=gatsby');
        expect(fluidFieldResult.srcWebp).toMatch('ixlib=gatsby');
        expect(fluidFieldResult.srcSet).toMatch('ixlib=gatsby');
        expect(fluidFieldResult.srcSetWebp).toMatch('ixlib=gatsby');
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

        const getSrcsetWidths: (srcset: string) => string[] = R.pipe(
          R.split(','),
          R.map(R.trim),
          R.map(R.split(' ')),
          R.map<readonly string[], string>(R.last),
        );

        const expectSrcsetToNotHaveWidthsGT = (maxWidth: number) => (
          srcset: string | undefined,
        ) => {
          if (srcset == null) {
            fail();
          }
          pipe(
            srcset,
            getSrcsetWidths,
            R.map(parseInt),
            R.all(R.lte(R.__, maxWidth)),
            (v) => expect(v).toBe(true),
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
  appConfig = {
    domain: 'assets.imgix.net',
    plugins: [],
  },
  field,
  fieldParams = {},
  url = 'amsterdam.jpg',
}: {
  appConfig?: PluginOptions<IGatsbySourceUrlOptions>;
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

  // Call createResolvers and capture the result
  const mockCreateResolversFunction = jest.fn();
  createResolvers &&
    createResolvers(
      ({
        createResolvers: mockCreateResolversFunction,
        cache: mockGatsbyCache,
      } as any) as CreateResolversArgsPatched,
      appConfig,
    );
  const resolverMap = mockCreateResolversFunction.mock.calls[0][0];

  const fieldParamsWithDefaults = {
    ...pipe(
      R.chain(
        (v: any): [string, any][] =>
          v.defaultValue ? [[v.name, v.defaultValue]] : [],
        resolverMap.Query.imgixImage.type.getFields()[field].args ?? [],
      ),
      (v) => R.fromPairs(v),
    ),
    ...fieldParams,
  };

  // Get root value from the root imgixImage resolver. This is passed to child resolvers.
  const imgixImageRootValue = resolverMap.Query.imgixImage.resolve({}, { url });

  // Resolve the `url` field in the imgixImage type
  const fieldResult = await resolverMap.Query.imgixImage.type
    .getFields()
    [field].resolve(imgixImageRootValue, fieldParamsWithDefaults);

  return fieldResult;
};
