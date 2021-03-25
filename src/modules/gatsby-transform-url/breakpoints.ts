import ImgixClient from '@imgix/js-core';
import { MAX_DPR, MAX_WIDTH } from './common';

const VARIABLE_QUALITIES = [75, 50, 35, 23, 20];

const min = (fallback: number, ...rest: (number | undefined)[]) =>
  Math.min(fallback, ...rest.filter<number>(isNotNull));

const isNotNull = <T>(v: T): v is Exclude<T, undefined | null> => v != null;

export type BreakpointsWithData = { width: number; quality: number }[];

/**
 * This function is a helper function which is designed to return a set of breakpoints that can be passed to `getImageData` from gatsby-plugin-image.
 *
 * @returns breakpoints and breakpointsWithData. breakpoints can be passed straight to gatsby-plugin-image, and breakpointsWithData should be passed as args to the buildUrl function so that it can apply variable quality for fixed srcsets.
 */
export const generateBreakpoints = (
  opts: (
    | {
        layout: 'fullWidth';
        width?: undefined;
      }
    | {
        layout: 'constrained';
        width?: number;
      }
    | {
        layout: 'fixed';
        width: number;
      }
  ) & {
    srcsetMinWidth?: number;
    srcsetMaxWidth?: number;
    widthTolerance?: number;
    sourceWidth?: number;
    disableVariableQuality?: boolean;
  },
): {
  breakpoints: number[];
  breakpointsWithData?: BreakpointsWithData;
} => {
  if (opts.layout === 'fixed') {
    const breakpoints = Array.from({ length: MAX_DPR })
      .map((_, i) => opts.width * (i + 1))
      .filter((width) => {
        return width <= min(MAX_SIZE, opts.sourceWidth);
      });

    const breakpointsWithData = !opts.disableVariableQuality
      ? breakpoints.map((width, i) => ({
          width,
          quality: VARIABLE_QUALITIES[i],
        }))
      : [];

    return { breakpoints, breakpointsWithData };
  }

  const width = opts.width;

  const widthTolerance = opts.widthTolerance ?? 0.08;
  const maxWidth = min(
    MAX_WIDTH,
    width ? width * MAX_DPR : undefined,
    opts.sourceWidth,
    opts.srcsetMaxWidth,
  );
  const minWidth = min(maxWidth, opts.srcsetMinWidth ?? 100);

  const fluidBreakpoints = ImgixClient.targetWidths(
    minWidth,
    maxWidth,
    widthTolerance,
  );

  const widthBreakpoints = width
    ? Array.from({ length: MAX_DPR })
        .map((_, i) => width * (i + 1))
        .filter((width) => width <= maxWidth)
        .filter((width) => fluidBreakpoints.indexOf(width) === -1)
    : [];

  return {
    breakpoints: [...fluidBreakpoints, ...widthBreakpoints].sort(
      (a, b) => a - b,
    ),
  };
};
