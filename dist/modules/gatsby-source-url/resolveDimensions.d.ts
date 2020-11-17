import { Option } from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
import ImgixClient from 'imgix-core-js';
export declare type IResolveDimensionsRight = {
    width: number;
    height: number;
};
export declare const resolveDimensions: <TSource>({ url, manualHeight, manualWidth, cache, client, }: {
    manualHeight: Option<number>;
    manualWidth: Option<number>;
    cache: GatsbyCache;
    url: string;
    client: ImgixClient;
}) => TE.TaskEither<Error, IResolveDimensionsRight>;
//# sourceMappingURL=resolveDimensions.d.ts.map