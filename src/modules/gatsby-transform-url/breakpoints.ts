import ImgixClient from 'imgix-core-js';

const VARIABLE_QUALITIES = [75, 50, 35, 23, 20];
const MAX_SIZE = 8192;
const MAX_DPR = 4;

const clamp = (clamp: number, val?: number) => Math.min(val ?? clamp, clamp);
const min = (fallback: number, ...rest: (number | undefined)[]) =>
  Math.min(fallback, ...rest.filter<number>(isNotNull));

const isNotNull = <T>(v: T): v is Exclude<T, undefined | null> => v != null;
export const generateBreakpoints = (
  opts: (
    | {
        layout: 'fullWidth';
        width?: number;
      }
    | {
        layout: 'fixed' | 'constrained';
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
  breakpointsWithData?: { width: number; quality: number }[];
} => {
  if (opts.layout === 'fixed') {
    const breakpoints = Array.from({ length: 5 })
      .reduce<number[]>((p, v, i) => {
        if (i === 0) {
          return [opts.width];
        }
        return [...p, opts.width * (i + 1)];
      }, [])
      .filter((width) => {
        return width < min(MAX_SIZE, opts.sourceWidth);
      });

    const breakpointsWithData = !opts.disableVariableQuality
      ? breakpoints.map((width, i) => ({
          width,
          quality: VARIABLE_QUALITIES[i],
        }))
      : [];

    return { breakpoints, breakpointsWithData };
  }

  // TODO: replace with static api when released
  const client = new ImgixClient({
    domain: 'unused.imgix.net',
  });

  const minWidth = opts.srcsetMinWidth;
  const maxWidth = min(
    MAX_SIZE,
    opts.width ? opts.width * MAX_DPR : undefined,
    opts.srcsetMinWidth,
  );

  return {
    breakpoints: (client as any)._generateTargetWidths(
      opts.widthTolerance,
      minWidth,
      maxWidth,
    ),
  };
};
