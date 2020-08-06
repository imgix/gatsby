import { CreateResolversArgsPatched } from 'gatsby';
import { createResolvers } from '../src/gatsby-node';

describe('createResolvers', () => {
  describe('url field', () => {
    it('resolves with a src', async () => {
      /* This is pretty convoluted test but I think it's better to test the whole thing e2e than just test the individual components and hope for the best.

      This test is equivalent to running a graphql query of
      {
        imgixImage(url: "image.jpg") {
          url
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
          } as any) as CreateResolversArgsPatched,
          {
            domain: 'test.imgix.net',
            plugins: [],
          },
        );
      const resolverMap = mockCreateResolversFunction.mock.calls[0][0];

      // Get root value from the root imgixImage resolver. This is passed to child resolvers.
      const imgixImageRootValue = resolverMap.Query.imgixImage.resolve(
        {},
        { url: 'image.jpg' },
      );

      // Resolve the `url` field in the imgixImage type
      const urlFieldResult = await resolverMap.Query.imgixImage.type
        .getFields()
        .url.resolve(imgixImageRootValue, {});

      expect(urlFieldResult).toMatch('test.imgix.net/image.jpg');
    });
    it('applies imgixParams correctly', async () => {
      /* This is pretty convoluted test but I think it's better to test the whole thing e2e than just test the individual components and hope for the best.

      This test is equivalent to running a graphql query of
      {
        imgixImage(url: "image.jpg", imgixParams: { w: 10 }) {
          url
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
          } as any) as CreateResolversArgsPatched,
          {
            domain: 'test.imgix.net',
            plugins: [],
          },
        );
      const resolverMap = mockCreateResolversFunction.mock.calls[0][0];

      // Get root value from the root imgixImage resolver. This is passed to child resolvers.
      const imgixImageRootValue = resolverMap.Query.imgixImage.resolve(
        {},
        { url: 'image.jpg' },
      );

      // Resolve the `url` field in the imgixImage type
      const urlFieldResult = await resolverMap.Query.imgixImage.type
        .getFields()
        .url.resolve(imgixImageRootValue, { imgixParams: { w: 10 } });

      expect(urlFieldResult).toMatch('w=10');
    });
  });
});
