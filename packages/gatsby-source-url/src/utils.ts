import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { getObjectSemigroup } from 'fp-ts/lib/Semigroup';
import { ImgixUrlParams } from './publicTypes';
export const taskEitherFromSourceDataResolver = <TSource, TData>(
  resolver: ImgixSourceDataResolver<TSource, TData>,
  predicate?: (data: TData | null) => boolean,
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

export type ImgixSourceDataResolver<TSource, TData> = (
  obj: TSource,
) => TData | null | undefined | Promise<TData | null | undefined>;

export const semigroupImgixUrlParams = getObjectSemigroup<ImgixUrlParams>();
