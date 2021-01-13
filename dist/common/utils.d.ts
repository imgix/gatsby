import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Reporter } from 'gatsby';
import { Response } from 'node-fetch';
import { ImgixUrlParams } from '../publicTypes';
export declare const taskEitherFromSourceDataResolver: <TSource, TData>(resolver: ImgixSourceDataResolver<TSource, TData>, predicate?: ((data: TData) => boolean) | undefined) => (source: TSource) => TE.TaskEither<Error, TData>;
export declare const resolveUrlFromSourceData: <TSource>(resolver: ImgixSourceDataResolver<TSource, string>) => (source: TSource) => TE.TaskEither<Error, string>;
export declare type ImgixSourceDataResolver<TSource, TData> = (obj: TSource) => TData | null | undefined | Promise<TData | null | undefined>;
export declare const semigroupImgixUrlParams: import("fp-ts/lib/Semigroup").Semigroup<ImgixUrlParams>;
export declare const noop: () => void;
export declare const fetch: (url: string) => TaskEither<Error, Response>;
export declare const fetchJSON: <A>(url: string) => TE.TaskEither<Error, A>;
export declare function invariant(condition: unknown, msg: string, reporter: Reporter): asserts condition;
export declare const transformUrlForWebProxy: (url: string, domain: string) => string;
//# sourceMappingURL=utils.d.ts.map