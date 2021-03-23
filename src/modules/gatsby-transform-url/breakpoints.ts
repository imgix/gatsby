const VARIABLE_QUALITIES = [75, 50, 35, 23, 20];

export const generateBreakpoints = (
  opts: (
    | {
        layout: 'constrained' | 'fullWidth';
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
  breakpointsWithData?: { width: number; quality: number }[];
} => {
  if (opts.layout === 'fixed') {
    const breakpoints = Array.from({ length: 5 }).reduce<number[]>(
      (p, v, i) => {
        if (i === 0) {
          return [opts.width];
        }
        return [...p, opts.width * (i + 1)];
      },
      [],
    );
    return { breakpoints };
  }
  return {
    breakpoints: [],
  };
};
