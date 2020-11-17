import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Response } from 'node-fetch';
import { ImgixUrlParams } from '../modules/gatsby-source-url/publicTypes';
export declare const taskEitherFromSourceDataResolver: <TSource, TData>(resolver: ImgixSourceDataResolver<TSource, TData>, predicate?: ((data: TData) => boolean) | undefined) => (source: TSource) => TE.TaskEither<Error, TData>;
export declare const resolveUrlFromSourceData: <TSource>(resolver: ImgixSourceDataResolver<TSource, string>) => (source: TSource) => TE.TaskEither<Error, string>;
export declare type ImgixSourceDataResolver<TSource, TData> = (obj: TSource) => TData | null | undefined | Promise<TData | null | undefined>;
export declare const semigroupImgixUrlParams: import("fp-ts/lib/Semigroup").Semigroup<ImgixUrlParams>;
export declare const noop: () => void;
export declare const fetch: (url: string) => TaskEither<Error, Response>;
export declare const fetchJSON: <A>(url: string) => TE.TaskEither<Error, A>;
//# sourceMappingURL=utils.d.ts.map