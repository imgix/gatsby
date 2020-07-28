import { buildFixedImageData, buildFluidImageData } from '../src';
import { IGatsbyImageFixedData, IGatsbyImageFluidData } from '../src/types';

describe('gatsby-transform-url', () => {
  describe('buildFixedImageData', () => {
    test('should return an imgix src', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.src).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return an imgix srcset', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.srcSet).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return a fixed srcset', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.srcSet).toMatch(/1x/);
    });
    test('height should match height passed as param', () => {
      const expectedHeight = 10;
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: expectedHeight,
      });

      expect(actual.height).toBe(expectedHeight);
      expect(actual.src).toMatch(`h=${expectedHeight}`);
      expect(actual.srcSet).toMatch(`h=${expectedHeight}`);
    });
    test('width should match width passed as param', () => {
      const expectedWidth = 10;
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        h: 10,
        w: expectedWidth,
      });

      expect(actual.width).toBe(expectedWidth);
      expect(actual.src).toMatch(`w=${expectedWidth}`);
      expect(actual.srcSet).toMatch(`w=${expectedWidth}`);
    });
  });
  describe('buildFluidImageData', () => {
    test('should return an imgix src', () => {
      const actual = buildFluidImageData(
        'https://test.imgix.net/image.jpg',
        {},
      );

      expect(actual.src).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return an imgix srcset', () => {
      const actual = buildFluidImageData(
        'https://test.imgix.net/image.jpg',
        {},
      );

      expect(actual.srcSet).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return a fluid srcset', () => {
      const actual = buildFluidImageData(
        'https://test.imgix.net/image.jpg',
        {},
      );

      expect(actual.srcSet).toMatch(/\dw,/);
    });
  });
});
