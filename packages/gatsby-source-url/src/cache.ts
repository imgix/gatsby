import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import { createLogger, trace } from './common/log';

const log = createLogger('cache');

export const withCache = <A, B>(
  key: string,
  cache: GatsbyCache,
  f: () => TaskEither<A, B>,
): TE.TaskEither<A | Error, B> =>
  pipe(
    trace(`Trying to retrieve ${key} from cache`, log)(''),
    () => getFromCache<B>(cache, key),
    TE.map(trace(`Successfully retrieved ${key} from cache with value`, log)),
    // If no cache hit, run function and store result in cache
    TE.orElse(() =>
      pipe(
        f(),
        trace(`Couldn't retrieve ${key} from cache, replacing with value`, log),
        TE.chainW(setToCache(key, cache)),
      ),
    ),
  );

export const getFromCache = <A>(
  cache: GatsbyCache,
  key: string,
): TaskEither<Error, A> =>
  TE.tryCatch(
    () =>
      cache.get(key).then((v: A | undefined | null) => {
        trace(`Retrieved value from cache for ${key}`, log)(v);
        if (v == null) {
          log(`Key ${key} doesn't exist in the cache`);
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
    () => {
      trace(`Successfully set "${key}" in cache to`, log)(value);
      return cache.set(key, value);
    },
    () => {
      trace(`Failed to set "${key}" in cache to`, log)(value);
      return new Error(`Failed to set "${key}" in cache to value: ${value}`);
    },
  );
