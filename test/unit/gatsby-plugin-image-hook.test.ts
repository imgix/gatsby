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

        expect(actual.breakpoints).toEqual([100, 200, 300, 400]);
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
          sourceWidth: 300,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(300);
        });
        actual?.breakpointsWithData?.map(({ width }) => {
          expect(width).toBeLessThanOrEqual(300);
        });
      });
      test(`should not generate widths larger than 8192px, even if source width is larger`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 2048,
          sourceWidth: 15000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(8192);
        });
        actual?.breakpointsWithData?.map(({ width }) => {
          expect(width).toBeLessThanOrEqual(8192);
        });
      });
    });
    describe(`layout: 'constrained'`, () => {
      test(`should generate widths that grow at ~8%`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 300,
        });

        expect(actual.breakpoints).toEqual([
          100,
          116,
          134,
          156,
          182,
          210,
          244,
          282,
          300,
          328,
          380,
          442,
          512,
          594,
          600,
          688,
          798,
          900,
          926,
          1074,
          1200,
        ]);
      });
      test(`should generate widths up to 4x constrained width if no sourceWidth set`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 1000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(4000);
        });
      });
      test(`should generate widths up to 4x constrained width if sourceWidth is larger than width`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 1000,
          sourceWidth: 8000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(4000);
        });
      });
      test(`should generate widths up to sourceWidth if sourceWidth is smaller than width and srcsetMaxWidth`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 1000,
          sourceWidth: 2000,
          srcsetMaxWidth: 3000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(2000);
        });
      });
      test(`should generate widths up to srcsetMaxWidth, if smaller than sourceWidth and 4 x width`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 1000,
          sourceWidth: 2000,
          srcsetMaxWidth: 1500,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(1500);
        });
      });
      test(`should not generate widths larger than 8192px, even if source width, width, and srcSetMaxWidth are larger`, () => {
        const actual = generateBreakpoints({
          layout: 'fixed',
          width: 5000,
          sourceWidth: 15000,
          srcsetMaxWidth: 9000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeLessThanOrEqual(8192);
        });
      });
      test(`should not generate widths smaller than srcsetMinWidth`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          srcsetMinWidth: 500,
          width: 1000,
        });

        actual.breakpoints.map((width) => {
          expect(width).toBeGreaterThanOrEqual(500);
        });
      });
      test(`should be able to change widthTolerance`, () => {
        const actual = generateBreakpoints({
          layout: 'constrained',
          width: 1000,
          widthTolerance: 0.3,
        });
        expect(actual.breakpoints).toEqual([
          100,
          160,
          256,
          410,
          656,
          1000,
          1048,
          1678,
          2000,
          2684,
          3000,
          4000,
        ]);
      });
    });
    describe(`layout: 'fullWidth'`, () => {
      test(`should generate widths up to max render size with no params`, () => {
        const actual = generateBreakpoints({
          layout: 'fullWidth',
        });
        expect(actual.breakpoints).toEqual([
          100,
          116,
          134,
          156,
          182,
          210,
          244,
          282,
          328,
          380,
          442,
          512,
          594,
          688,
          798,
          926,
          1074,
          1246,
          1446,
          1678,
          1946,
          2258,
          2618,
          3038,
          3524,
          4088,
          4742,
          5500,
          6380,
          7400,
          8192,
        ]);
      });
      test(`should generate widths up to sourceWidth, even if srcsetMaxWidth is larger`, () => {
        const actual = generateBreakpoints({
          layout: 'fullWidth',
          sourceWidth: 4000,
          srcsetMaxWidth: 5000,
        });

        actual.breakpoints.map((width) =>
          expect(width).toBeLessThanOrEqual(4000),
        );
      });
      test(`should generate widths up to srcsetMaxWidth`, () => {
        const actual = generateBreakpoints({
          layout: 'fullWidth',
          srcsetMaxWidth: 4200,
        });

        actual.breakpoints.map((width) =>
          expect(width).toBeLessThanOrEqual(4200),
        );
      });
      test(`should not generate widths smaller than srcsetMinWidth`, () => {
        const actual = generateBreakpoints({
          layout: 'fullWidth',
          srcsetMinWidth: 200,
        });

        actual.breakpoints.map((width) =>
          expect(width).toBeGreaterThanOrEqual(200),
        );
      });
      test(`should be able to change widthTolerance`, () => {
        const actual = generateBreakpoints({
          layout: 'fullWidth',
          widthTolerance: 0.5,
        });
        expect(actual.breakpoints).toEqual([
          100,
          200,
          400,
          800,
          1600,
          3200,
          6400,
          8192,
        ]);
      });
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
