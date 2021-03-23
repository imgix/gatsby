import { describe, expect, test } from '@jest/globals';
import { VERSION } from '../../src/common/constants';
import { getGatsbyImageData } from '../../src/modules/gatsby-transform-url';
import { generateBreakpoints } from '../../src/modules/gatsby-transform-url/breakpoints';
import {
  getAspectRatioFromUrl,
  isFixedSrcSet,
  isValidSrcSet,
} from '../common/url';

describe('gatsby-plugin-image hook', () => {
  describe(`every layout`, () => {
    test(`should have a valid src`, () => {
      testForEveryLayout({
        params: { src: 'https://test.imgix.net/image.jpg', aspectRatio: 2 },
        assertion: (data) =>
          expect(data.images?.fallback?.src).toMatch(
            /^https:\/\/test.imgix.net\/image.jpg\?/,
          ),
      });
    });
    test(`should have a valid srcset`, () => {
      testForEveryLayout({
        params: { src: 'https://test.imgix.net/image.jpg', aspectRatio: 2 },
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
          src: 'https://test.imgix.net/image.jpg',
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
        src: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(isFixedSrcSet(actual.images?.fallback?.srcSet));
    });
    test(`should set a fixed sizes attribute by default`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.sizes).toMatch('10px');
    });
    test.skip(`should have decreasing variable quality`, () => {});
    test(`should set height from 'height' param`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        width: 10,
        height: 20,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('h=20');
      expect(actual.height).toBe(20);
    });
    test(`should calculate height from aspectRatio`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        width: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('h=5');
      expect(actual.height).toBe(5);
    });
    test(`should calculate height from sourceWidth and sourceHeight`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
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
        src: 'https://test.imgix.net/image.jpg',
        width: 10,
        height: 20,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('w=10');
      expect(actual.width).toBe(10);
    });
    test(`should calculate width from aspectRatio`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        aspectRatio: 2,
        height: 10,
        layout: 'fixed',
      });

      expect(actual.images?.fallback?.src).toMatch('w=20');
      expect(actual.width).toBe(20);
    });
    test(`should calculate width from sourceWidth and sourceHeight`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
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
            src: 'https://test.imgix.net/image.jpg',
            height: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if only 'sourceWidth' set and 'width' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            sourceWidth: 1000,
            height: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if 'aspectRatio', 'sourceWidth', 'sourceHeight' not set and 'height' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            width: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
      test(`should show warning if only 'sourceWidth' set and 'height' not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            sourceHeight: 1000,
            width: 15,
            layout: 'fixed',
          });

        expect(actual).toThrow(/aspectRatio/);
      });
    });
  });

  describe(`layout: 'constrained' and layout: 'fullWidth`, () => {
    test(`should set width and height in url matching aspectRatio`, () => {
      testForLayouts(['constrained', 'fullWidth'], {
        params: {
          src: 'https://test.imgix.net/image.jpg',
          aspectRatio: 2,
          width: 10,
        },
        assertion: (data) => {
          expect(getAspectRatioFromUrl(data.images?.fallback?.src)).toBe(2);
          data.images?.fallback?.srcSet
            ?.split(', ')
            .map((srcset) => srcset.split(' ')[0])
            .map((srcsetUrl) =>
              expect(getAspectRatioFromUrl(srcsetUrl)).toBe(2),
            );
        },
      });
    });
    test(`should set width and height in url matching aspect ratio of source width and source height`, () => {
      testForLayouts(['constrained', 'fullWidth'], {
        params: {
          src: 'https://test.imgix.net/image.jpg',
          sourceWidth: 100,
          sourceHeight: 50,
          width: 10,
        },
        assertion: (data) => {
          expect(getAspectRatioFromUrl(data.images?.fallback?.src)).toBe(2);
          data.images?.fallback?.srcSet
            ?.split(', ')
            .map((srcset) => srcset.split(' ')[0])
            .map((srcsetUrl) =>
              expect(getAspectRatioFromUrl(srcsetUrl)).toBe(2),
            );
        },
      });
    });
    describe(`layout helper`, () => {
      test(`should show warning if both aspectRatio and sourceWidth and sourceHeight not set`, () => {
        const actual = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            width: 10,
            layout: 'fullWidth',
          });

        expect(actual).toThrow('aspectRatio');

        const actual2 = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            width: 10,
            layout: 'constrained',
          });

        expect(actual2).toThrow('aspectRatio');
      });
      test(`should show warning if only sourceWidth set and not sourceHeight (and not aspectRatio)`, () => {
        const actual = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            width: 10,
            sourceWidth: 100,
            layout: 'fullWidth',
          });

        expect(actual).toThrow('aspectRatio');

        const actual2 = () =>
          getGatsbyImageData({
            src: 'https://test.imgix.net/image.jpg',
            width: 10,
            layout: 'constrained',
          });

        expect(actual2).toThrow('aspectRatio');
      });
    });
  });
  describe(`layout: 'constrained'`, () => {
    test(`should have a valid sizes`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        width: 1000,
        aspectRatio: 2,
      });
      expect(actual.images?.fallback?.sizes).toMatch('min-width: 1000px');
    });
  });
  describe(`layout: 'fullWidth'`, () => {
    test(`should have a valid sizes`, () => {
      const actual = getGatsbyImageData({
        src: 'https://test.imgix.net/image.jpg',
        width: 1000,
        aspectRatio: 2,
      });
      expect(actual.images?.fallback?.sizes).toMatch('100vw');
    });
  });

  describe(`breakpoints generation`, () => {
    describe(`layout: 'fixed'`, () => {
      test(`should generate widths at 1x, 2x, 3x, 3x, and 5x width`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 100,
        });

        expect(actual.breakpoints).toEqual([100, 200, 300, 400, 500]);
      });
      test(`should reduce quality when increasing size`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 100,
        });

        if (actual.breakpointsWithData == null) {
          fail('actual.breakpointsWithData not set');
          return;
        }
        expect(actual.breakpointsWithData.length).toBeGreaterThan(1);
        actual.breakpointsWithData?.map((v, i) => {
          if (i === 0) {
            return;
          }

          expect(v.quality).toBeLessThan(
            (actual?.breakpointsWithData || [])[i - 1].quality,
          );
        });
      });
      test(`should be able to disable variable quality`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 100,
          disableVariableQuality: true,
        });

        expect(
          actual.breakpointsWithData == null ||
            actual.breakpointsWithData.length === 0,
        ).toBe(true);
      });
      test(`should not generate widths larger than sourceWidth`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 100,
          sourceWidth: 250,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThan(250);
        });
        actual?.breakpointsWithData?.map(({ width }) => {
          expect(width).toBeLessThan(250);
        });
      });
      test(`should not generate widths larger than 8192px, even if source width is larger`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 5000,
          sourceWidth: 15000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThan(8192);
        });
        actual?.breakpointsWithData?.map(({ width }) => {
          expect(width).toBeLessThan(8192);
        });
      });
    });
    describe(`layout: 'constrained'`, () => {
      test.skip(`should generate widths up to constrained width if no sourceWidth set`, () => {});
      test.skip(`should generate widths up to constrained width if sourceWidth is larger than width`, () => {});
      test.skip(`should generate widths up to sourceWidth if sourceWidth is small than width`, () => {});
      test.skip(`should generate widths up to srcsetMaxWidth, even if sourceWidth and width are set`, () => {});
      test.skip(`should not generate widths smaller than srcsetMinWidth`, () => {});
      test.skip(`should be able to change widthTolerance`, () => {});
    });
    describe(`layout: 'fullWidth'`, () => {
      test.skip(`should generate widths up to max render size with no params`, () => {});
      test.skip(`should generate widths up to sourceWidth`, () => {});
      test.skip(`should generate widths up to srcsetMaxWidth`, () => {});
      test.skip(`should not generate widths smaller than srcsetMinWidth`, () => {});
      test.skip(`should be able to change widthTolerance`, () => {});
    });
  });
});

const testForEveryLayout = (opts: ITestForLayoutOpts) => {
  testForLayout('constrained')(opts);
  testForLayout('fullWidth')(opts);
  testForLayout('fixed')(opts);
};
const testForLayouts = (
  layouts: ('constrained' | 'fullWidth' | 'fixed')[],
  opts: ITestForLayoutOpts,
) => {
  layouts.map((layout) => testForLayout(layout)(opts));
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
