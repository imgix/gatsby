import { Reporter } from 'gatsby';

export type ImgixSourceDataResolver<TSource, TData> = (
  obj: TSource,
) => TData | null | undefined | Promise<TData | null | undefined>;

export const noop = (): void => {
  // noop
};

export function invariant(
  condition: unknown,
  msg: string,
  reporter: Reporter,
): asserts condition {
  if (!condition) reporter.panic(`Invariant failed: ${msg}`);
}

function isURL(str: string) {
  var pattern = new RegExp(
    '\\/\\/' + // the first two slashes after the protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  );
  return pattern.test(str);
}

export const findPossibleURLsInNode = (
  node: object,
  depth: number = 0,
): { path: string; value: string }[] => {
  if (depth > 5) {
    return [];
  }

  return Object.entries(node).reduce((p, [key, value]) => {
    if (typeof value === 'string' && isURL(value)) {
      return [...p, { path: key, value }];
    }
    if (typeof value === 'object' && value != null) {
      return [
        ...p,
        ...findPossibleURLsInNode(value, depth + 1).map(({ path, value }) => ({
          path: `${key}.${path}`,
          value,
        })),
      ];
    }
    return p;
  }, [] as { path: string; value: string }[]);
};
