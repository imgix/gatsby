import readPkg from 'read-pkg';
import { buildFixedImageData, buildFluidImageData } from '../src';
import { IGatsbyImageFixedData, IGatsbyImageFluidData } from '../src/types';

const shouldHaveIxLib = async (
  fut: () => IGatsbyImageFluidData | IGatsbyImageFixedData,
) => {
  test('src and srcset should have ixlib set to gatsby-transform-url-VERSION', async () => {
    const actual = fut();

    const expectedIxLibRegex = RegExp(
      `ixlib=gatsby-transform-url-${(await readPkg()).version}`,
    );

    expect(actual.src).toMatch(expectedIxLibRegex);
    expect(actual.srcSet).toMatch(expectedIxLibRegex);
  });
};
const shouldBeAbleToDisableIxLib = (
  fut: (options: {
    includeLibraryParam?: boolean;
  }) => IGatsbyImageFixedData | IGatsbyImageFluidData,
) => {
  test('when ixlib is disabled, src and srcset should not have ixlib set', async () => {
    const actual = fut({ includeLibraryParam: false });

    const expectedIxLibRegex = RegExp(`ixlib=`);

    expect(actual.src).not.toMatch(expectedIxLibRegex);
    expect(actual.srcSet).not.toMatch(expectedIxLibRegex);
  });
};

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
    shouldHaveIxLib(() =>
      buildFixedImageData('https://test.imgix.net/image.jpg', { w: 1, h: 1 }),
    );
    shouldBeAbleToDisableIxLib((options: { includeLibraryParam?: boolean }) =>
      buildFixedImageData(
        'https://test.imgix.net/image.jpg',
        { w: 1, h: 1 },
        options,
      ),
    );

    test('should have fit=crop set', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
      });

      expect(actual.src).toMatch(`fit=crop`);
      expect(actual.srcSet).toMatch(`fit=crop`);
    });
    test('should be able to override fit', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
        fit: 'clip',
      });

      expect(actual.src).toMatch(`fit=clip`);
      expect(actual.srcSet).toMatch(`fit=clip`);
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
    shouldHaveIxLib(() =>
      buildFluidImageData('https://test.imgix.net/image.jpg', {}),
    );
    shouldBeAbleToDisableIxLib((options: { includeLibraryParam?: boolean }) =>
      buildFluidImageData('https://test.imgix.net/image.jpg', {}, options),
    );

    test('should pass aspect ratio to src and srcset', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2.1,
      });

      expect(actual.src).toMatch(`ar=2.1%3A1`);
      expect(actual.srcSet).toMatch(`ar=2.1%3A1`);
    });
    test('should have fit=crop set', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2,
      });

      expect(actual.src).toMatch(`fit=crop`);
      expect(actual.srcSet).toMatch(`fit=crop`);
    });
    test('should be able to override fit', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2,
        fit: 'clip',
      });

      expect(actual.src).toMatch(`fit=clip`);
      expect(actual.srcSet).toMatch(`fit=clip`);
    });
    test('should return aspect ratio in resulting data object', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2.1,
      });

      expect(actual).toMatchObject({
        aspectRatio: 2.1,
      });
    });
  });
});
