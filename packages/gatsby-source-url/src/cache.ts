import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';

export const withCache = <A, B>(
  key: string,
  cache: GatsbyCache,
  f: () => TaskEither<A, B>,
): TE.TaskEither<A | Error, B> =>
  pipe(
    getFromCache<B>(cache, key),
    // If no cache hit, run function and store result in cache
    TE.orElse(() => pipe(f(), TE.chainW(setToCache(key, cache)))),
  );

export const getFromCache = <A>(
  cache: GatsbyCache,
  key: string,
): TaskEither<Error, A> =>
  TE.tryCatch(
    () =>
      cache.get(key).then((v: A | undefined | null) => {
        if (v == null) {
          throw new Error(`Key ${key} doesn't exist in the cache`);
        }
        return v;
      }),
    () => new Error(`Failed to get "${key}" in cache.`),
  );

export const setToCache = <A>(key: string, cache: GatsbyCache) => (
  value: A,
): TaskEither<Error, A> =>
  TE.tryCatch(
    () => cache.set(key, value),
    () => new Error(`Failed to set "${key}" in cache to value: ${value}`),
  );
