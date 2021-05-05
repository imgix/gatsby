import { sequenceS, sequenceT } from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import * as TE from 'fp-ts/TaskEither';
import { GatsbyCache } from 'gatsby';
import { fetchImgixMetadata } from '../../api/fetchImgixMetadata';
import { IImgixURLBuilder } from '../../common/imgix-js-core-wrapper';
import { createLogger, trace } from '../../common/log';

const sequenceTTE = sequenceT(TE.taskEither);
const sequenceSO = sequenceS(O.option);

const log = createLogger('resolveDimensions');
// TODO: maybe use io-ts PositiveNumber
export type IResolveDimensionsRight = { width: number; height: number };
export const resolveDimensions = <TSource>({
  url,
  manualHeight,
  manualWidth,
  cache,
  client,
}: {
  manualHeight: Option<number>;
  manualWidth: Option<number>;
  cache: GatsbyCache;
  url: string;
  client: IImgixURLBuilder;
}): TE.TaskEither<Error, IResolveDimensionsRight> => {
  const WidthHeightTE: TE.TaskEither<
    Error,
    { width: number; height: number }
  > = pipe(
    sequenceSO({ width: manualHeight, height: manualHeight }),
    O.fold(
      () => TE.left(new Error(`Couldn't find manual width on obj`)),
      TE.right,
    ),
  );

  return pipe(
    WidthHeightTE,
    TE.map(trace('manual width and height', log)),
    TE.orElse(() =>
      pipe(
        url,
        fetchImgixMetadata(cache, client),
        TE.map(trace('fetchImgixMetadata result', log)),
        TE.map(({ PixelWidth, PixelHeight }) => ({
          width: PixelWidth,
          height: PixelHeight,
        })),
      ),
    ),
  );
};
