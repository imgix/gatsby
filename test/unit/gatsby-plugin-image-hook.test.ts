import { describe, expect, test } from '@jest/globals';
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
    test.skip(`should set a fixed sizes attribute by default`, () => {});
    test.skip(`should have a fixed srcset`, () => {});
    test.skip(`should have decreasing variable quality`, () => {});
    test.skip(`should set height from 'height' param`, () => {});
    test.skip(`should calculate height from aspectRatio`, () => {});
    test.skip(`should calculate height from sourceWidth and sourceHeight`, () => {});
    test.skip(`should set width from 'width' param`, () => {});
    test.skip(`should calculate width from aspectRatio`, () => {});
    test.skip(`should calculate width from sourceWidth and sourceHeight`, () => {});
    test.skip(`should set ixlib in src`, () => {});
    test.skip(`should set ixlib in srcset`, () => {});
    describe(`layout helper`, () => {
      test.skip(`should show warning if all of 'aspectRatio', 'sourceWidth', 'sourceHeight' not set and 'width' not set`, () => {});
      test.skip(`should show warning if all of 'aspectRatio', 'sourceWidth', 'sourceHeight' not set and 'height' not set`, () => {});
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
