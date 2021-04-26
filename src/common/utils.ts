import { pipe } from 'fp-ts/pipeable';
import { getObjectSemigroup } from 'fp-ts/Semigroup';
import * as TE from 'fp-ts/TaskEither';
import { TaskEither } from 'fp-ts/TaskEither';
import { Reporter } from 'gatsby';
import _fetch, { Response } from 'node-fetch';
import { ImgixUrlParams } from '../publicTypes';
export const taskEitherFromSourceDataResolver = <TSource, TData>(
  resolver: ImgixSourceDataResolver<TSource, TData>,
  predicate?: (data: TData) => boolean,
) => (source: TSource): TaskEither<Error, TData> =>
  TE.tryCatch(
    () =>
      Promise.resolve(resolver(source)).then((data) => {
        if (data == null)
          return Promise.reject('Resolved data is null or undefined');

        if (!predicate) return data;

        return predicate(data)
          ? data
          : Promise.reject('Resolved data is invalid.');
      }),
    (reason) => new Error(String(reason)),
  );

export const resolveUrlFromSourceData = <TSource>(
  resolver: ImgixSourceDataResolver<TSource, string>,
) => taskEitherFromSourceDataResolver(resolver, (data: string) => data != null);

export type ImgixSourceDataResolver<TSource, TData> = (
  obj: TSource,
) => TData | null | undefined | Promise<TData | null | undefined>;

export const semigroupImgixUrlParams = getObjectSemigroup<ImgixUrlParams>();

export const noop = (): void => {
  // noop
};

export const fetch = (url: string): TaskEither<Error, Response> =>
  TE.tryCatch(
    () => _fetch(url),
    (reason) => new Error(String(reason)),
  );

export const fetchJSON = <A>(url: string): TaskEither<Error, A> =>
  pipe(
    url,
    fetch,
    TE.chain((res) => TE.rightTask(() => res.json())),
  );

export function invariant(
  condition: unknown,
  msg: string,
  reporter: Reporter,
): asserts condition {
  if (!condition) reporter.panic(`Invariant failed: ${msg}`);
}
export const transformUrlForWebProxy = (
  url: string,
  domain: string,
): string => {
  const instance = new URL(`https://${domain}`);
  instance.pathname = encodeURIComponent(url);
  return instance.toString();
};

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
