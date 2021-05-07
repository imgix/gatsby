import * as fetchImgixMetadataModule from '../../src/api/fetchImgixMetadata';
import { createImgixGatsbyTypes } from '../../src/pluginHelpers';

// test('should be able to call createImgixUrlFieldConfig with no domain and resolve a url', async () => {
//   const config = createImgixUrlSchemaFieldConfig({
//     resolveUrl: (node) => (node as any).url,
//   });

//   const resolved = await (config as any).resolve(
//     { url: 'https://assets.imgix.net/amsterdam.jpg' },
//     {},
//   );

//   expect(resolved).toMatch(/^https:\/\/assets.imgix.net\/amsterdam.jpg\?/);
// });
// test('should be able to call createImgixUrlFieldConfig with a domain and resolve a url', async () => {
//   const config = createImgixUrlSchemaFieldConfig({
//     resolveUrl: (node) => (node as any).url,
//     imgixClientOptions: { domain: 'assets.imgix.net' },
//   });

//   const resolved = await (config as any).resolve({ url: 'amsterdam.jpg' }, {});

//   expect(resolved).toMatch(/^https:\/\/assets.imgix.net\/amsterdam.jpg\?/);
// });

describe('plugin helpers', () => {
  describe('resolveWidth and resolveHeight', () => {
    it('should not make a request to imgix when resolveWidth and resolveHeight passed', async () => {
      const spy = jest.spyOn(fetchImgixMetadataModule, 'fetchImgixMetadata');

      const types = createImgixGatsbyTypes({
        cache: mockGatsbyCache as any,
        resolveUrl: () => 'https://assets.imgix.net/amsterdam.jpg',
        resolveHeight: () => 200,
        resolveWidth: () => 300,
      });

      await (types.fields.fluid.resolve &&
        types.fields.fluid.resolve(
          {},
          {
            imgixParams: {},
          },
          {},
          {} as any,
        ));

      expect(spy).not.toBeCalled();

      jest.resetModules();
    });

    it('should make a request to imgix when resolveWidth and resolveHeight not passed', async () => {
      const spy = jest.spyOn(fetchImgixMetadataModule, 'fetchImgixMetadata');

      const types = createImgixGatsbyTypes({
        cache: mockGatsbyCache as any,
        resolveUrl: () => 'https://assets.imgix.net/amsterdam.jpg',
      });

      await (types.fields.fluid.resolve &&
        types.fields.fluid.resolve(
          {},
          {
            imgixParams: {},
          },
          {},
          {} as any,
        ));

      expect(spy).toBeCalled();

      jest.resetModules();
    });

    it('should resolve dimensions as given', async () => {
      const width = 200;
      const height = 100;
      const aspectRatio = width / height;

      const types = createImgixGatsbyTypes({
        cache: mockGatsbyCache as any,
        resolveUrl: () => 'https://assets.imgix.net/amsterdam.jpg',
        resolveWidth: () => width,
        resolveHeight: () => height,
      });

      const fluid = await types.fields.fluid.resolve?.(
        {},
        { imgixParams: {} },
        {},
        {} as any,
      );
      const fixed = await types.fields.fixed.resolve?.(
        {},
        { imgixParams: {} },
        {},
        {} as any,
      );
      const gatsbyImageData = await types.fields.gatsbyImageData.resolve?.(
        {},
        { imgixParams: {} },
        {},
        {} as any,
      );

      expect(fluid.aspectRatio).toBe(aspectRatio);
      expect(fixed.width / fixed.height).toBe(aspectRatio);
      expect(gatsbyImageData.width).toBe(width);
      expect(gatsbyImageData.height).toBe(height);
    });
  });
});

const mockGatsbyCache = {
  store: {} as { [k: string]: any },
  async get(key: string) {
    // trace(`Getting cache value for`, log)(key);
    return this.store[key];
  },
  async set(key: string, value: any) {
    // trace(`Setting cache value for ${key} to ${value}`, log)(value);
    this.store[key] = value;
    return value;
  },
} as any;
