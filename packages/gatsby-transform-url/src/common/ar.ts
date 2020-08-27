import * as t from 'io-ts';
import * as R from 'ramda';
import { roundToDP } from './number';
interface AspectRatioBrand {
  readonly StringAspectRatio: unique symbol;
}

export const StringAspectRatio = t.brand(
  t.string,
  (v): v is t.Branded<string, AspectRatioBrand> => aspectRatioIsValid(v),
  'StringAspectRatio',
);
export type StringAspectRatio = t.TypeOf<typeof StringAspectRatio>;

/**
 * Validates that an aspect ratio is in the format w:h. If false is returned, the aspect ratio is in the wrong format.
 */
function aspectRatioIsValid(aspectRatio: string): boolean {
  if (typeof aspectRatio !== 'string') {
    return false;
  }

  return /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(aspectRatio);
}
export const parseStringARParam = (ar: StringAspectRatio): number =>
  R.pipe(
    (v: StringAspectRatio) => v.split(':') as [string, string],
    R.map((part) => parseFloat(part)),
    ([width, height]) => width / height,
    (v) => roundToDP(3, v),
  )(ar);
