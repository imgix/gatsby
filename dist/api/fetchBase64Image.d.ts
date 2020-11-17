import * as TE from 'fp-ts/lib/TaskEither';
import { GatsbyCache } from 'gatsby';
export declare const buildBase64URL: (contentType: string, base64: string) => string;
export declare const fetchImgixBase64Image: (cache: GatsbyCache) => (url: string) => TE.TaskEither<Error, string>;
//# sourceMappingURL=fetchBase64Image.d.ts.map