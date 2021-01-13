import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
export declare const withCache: <A, B>(key: string, cache: GatsbyCache, f: () => TE.TaskEither<A, B>) => TE.TaskEither<Error | A, B>;
export declare const getFromCache: <A>(cache: GatsbyCache, key: string) => TE.TaskEither<Error, A>;
export declare const setToCache: <A>(key: string, cache: GatsbyCache) => (value: A) => TE.TaskEither<Error, A>;
//# sourceMappingURL=cache.d.ts.map