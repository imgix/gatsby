import { buildFixedImageData } from '../src';

describe('gatsby-transform-url', () => {
  describe('buildFixedImageData', () => {
    test('should return an imgix src', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.src).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
  });
});
