import { describe, expect, test } from '@jest/globals';
import { VERSION } from '../../src/common/constants';
import { getGatsbyImageData } from '../../src/modules/gatsby-transform-url';
import { isFixedSrcSet, isValidSrcSet } from '../common/url';

describe('gatsby-plugin-image hook', () => {
  describe(`every layout`, () => {
    test(`should have a valid src`, () => {
      testForEveryLayout({
        params: { url: 'https://test.imgix.net/image.jpg', aspectRatio: 2 },
        assertion: (data) =>
          expect(data.images?.fallback?.src).toMatch(
            /^https:\/\/test.imgix.net\/image.jpg\?/,
          ),
      });
    });
    test(`should have a valid srcset`, () => {
      testForEveryLayout({
        params: { url: 'https://test.imgix.net/image.jpg', aspectRatio: 2 },
        assertion: (data) => {
          expect(isValidSrcSet(data.images?.fallback?.srcSet)).toBe(true);
          expect(data.images?.fallback?.srcSet).toContain(
            'https://test.imgix.net/image.jpg?',
          );
        },
      });
    });
    test(`should pass through backgroundColor`, () => {
      const bg = '#123456';
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
          backgroundColor: bg,
        },
        assertion: (data) => {
          expect(data.backgroundColor).toBe(bg);
        },
      });
    });
    test(`should not have any images (only fallback)`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
        },
        assertion: (data) => {
          expect(data.images.sources).toHaveLength(0);
        },
      });
    });
    test(`should have fit=min set by default`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
        },
        assertion: (data) => {
          expect(data.images?.fallback?.src).toMatch('fit=min');
        },
      });
    });
    test(`should be able to override fit`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
          imgixParams: { fit: 'max' },
        },
        assertion: (data) => {
          expect(data.images?.fallback?.src).toMatch('fit=max');
        },
      });
    });
    test(`should set sizes by default`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
        },
        assertion: (data) => {
          expect(data.images?.fallback?.sizes).toBeTruthy();
        },
      });
    });
    test(`should set ixlib in src`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
        },
        assertion: (data) => {
          expect(data.images?.fallback?.src).toMatch(
            `ixlib=gatsbyHook-${VERSION}`,
          );
        },
      });
    });
    test(`should set ixlib in srcset`, () => {
      testForEveryLayout({
        params: {
          url: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
        },
        assertion: (data) => {
          expect(data.images?.fallback?.srcSet).toMatch(
            `ixlib=gatsbyHook-${VERSION}`,
          );
        },
      });
    });
  });

  describe(`layout: 'fixed'`, () => {
    test(`should have a fixed srcset`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(isFixedSrcSet(actual.images?.fallback?.srcSet));
    });
    test(`should set a fixed sizes attribute by default`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.sizes).toMatch('10px');
    });
    test.skip(`should have decreasing variable quality`, () => {});
    test(`should set height from 'height' param`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        width: 10,
        height: 20,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('h=20');
      expect(actual.height).toBe(20);
    });
    test(`should calculate height from aspectRatio`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('h=5');
      expect(actual.height).toBe(5);
    });
    test(`should calculate height from sourceWidth and sourceHeight`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        sourceWidth: 100,
        sourceHeight: 150,
        width: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('h=15');
      expect(actual.height).toBe(15);
    });
    test(`should set width from 'width' param`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        width: 10,
        height: 20,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('w=10');
      expect(actual.width).toBe(10);
    });
    test(`should calculate width from aspectRatio`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        height: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('w=20');
      expect(actual.width).toBe(20);
    });
    test(`should calculate width from sourceWidth and sourceHeight`, () => {
      const actual = getGatsbyImageData({
        url: 'https://test.imgix.net/image.jpg',
        sourceWidth: 100,
        sourceHeight: 150,
        height: 15,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('w=10');
      expect(actual.width).toBe(10);
    });
    describe(`layout helper`, () => {
      test(`should show warning if 'aspectRatio', 'sourceWidth', 'sourceHeight' not set and 'width' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            url: 'https://test.imgix.net/image.jpg',
            height: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if only 'sourceWidth' set and 'width' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            url: 'https://test.imgix.net/image.jpg',
            sourceWidth: 1000,
            height: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if 'aspectRatio', 'sourceWidth', 'sourceHeight' not set and 'height' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            url: 'https://test.imgix.net/image.jpg',
            width: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if only 'sourceWidth' set and 'height' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            url: 'https://test.imgix.net/image.jpg',
            sourceHeight: 1000,
            width: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
    });
  });

  describe(`layout: 'constrained' and layout: 'fullWidth`, () => {
    test.skip(`should set width and height in url matching aspectRatio`, () => {});
    test.skip(`should set width and height in url matching aspect ratio of source width and source height`, () => {});
    describe(`layout helper`, () => {
      test.skip(`should show warning if both aspectRatio and sourceWidth and sourceHeight not set`, () => {});
    });
  });
  describe(`layout: 'constrained'`, () => {
    test.skip(`should have a valid sizes`, () => {});
  });
  describe(`layout: 'fullWidth'`, () => {
    test.skip(`should have a valid sizes`, () => {});
  });
});

const testForEveryLayout = (opts: ITestForLayoutOpts) => {
  testForLayout('constrained')(opts);
  testForLayout('fullWidth')(opts);
  testForLayout('fixed')(opts);
};

type ITestForLayoutOpts = {
  params: Parameters<typeof getGatsbyImageData>[0];
  assertion: (data: ReturnType<typeof getGatsbyImageData>) => void;
};
const testForLayout = (layout: 'constrained' | 'fullWidth' | 'fixed') => ({
  params,
  assertion,
}: ITestForLayoutOpts) => {
  const result = getGatsbyImageData({
    layout,
    aspectRatio:
      // Set default aspect ratio
      (layout === 'constrained' || layout == 'fullWidth') &&
      params.sourceWidth == null
        ? 2
        : undefined,
    ...params,
  });
  assertion(result);
};
