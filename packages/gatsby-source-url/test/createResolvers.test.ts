/// <reference types="../types/gatsby" />

import { CreateResolversArgsPatched, PluginOptions } from 'gatsby';
import { createResolvers } from '../src/gatsby-node';
import { IGatsbySourceUrlOptions } from '../src/publicTypes';

describe('createResolvers', () => {
  describe('url field', () => {
    it('resolves with a src', async () => {
      const urlFieldResult = await resolveField({
        field: 'url',
      });

      expect(urlFieldResult).toMatch('test.imgix.net/image.jpg');
    });
    it('applies imgixParams correctly', async () => {
      const urlFieldResult = await resolveField({
        field: 'url',
        fieldParams: { imgixParams: { w: 10 } },
      });

      expect(urlFieldResult).toMatch('w=10');
    });
  });
});

const resolveField = async ({
  appConfig = {
    domain: 'test.imgix.net',
    plugins: [],
  },
  field,
  fieldParams = {},
  url = 'image.jpg',
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
      } as any) as CreateResolversArgsPatched,
      appConfig,
    );
  const resolverMap = mockCreateResolversFunction.mock.calls[0][0];

  // Get root value from the root imgixImage resolver. This is passed to child resolvers.
  const imgixImageRootValue = resolverMap.Query.imgixImage.resolve({}, { url });

  // Resolve the `url` field in the imgixImage type
  const fieldResult = await resolverMap.Query.imgixImage.type
    .getFields()
    [field].resolve(imgixImageRootValue, fieldParams);

  return fieldResult;
};
