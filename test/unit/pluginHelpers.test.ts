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
      const fetchImgixMetadataModule = require('../../src/api/fetchImgixMetadata');
      const spy = jest.spyOn(fetchImgixMetadataModule, 'fetchImgixMetadata');

      const { createImgixGatsbyTypes } = require('../../src/pluginHelpers');

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
      const fetchImgixMetadataModule = require('../../src/api/fetchImgixMetadata');
      const spy = jest.spyOn(fetchImgixMetadataModule, 'fetchImgixMetadata');

      const { createImgixGatsbyTypes } = require('../../src/pluginHelpers');

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
