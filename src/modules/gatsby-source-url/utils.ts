import { pipe } from 'fp-ts/lib/pipeable';
import { getObjectSemigroup } from 'fp-ts/lib/Semigroup';
import * as TE from 'src/api/node_modules/fp-ts/lib/TaskEither';
import { TaskEither } from 'src/api/node_modules/fp-ts/lib/TaskEither';
import _fetch, { Response } from 'node-fetch';
import { ImgixUrlParams } from './publicTypes';
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

// TODO: maybe better url type here?
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

// export const taskOptionFromPromise = <T>(p: Promise<T>): Task<Option<T>> =>
export const fetchJSON = <A>(url: string): TaskEither<Error, A> =>
  pipe(
    url,
    fetch,
    TE.chain((res) => TE.rightTask(() => res.json())),
  );
