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

test.todo('Placeholder');
