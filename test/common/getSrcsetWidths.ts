import { pipe, split, map, last, trim } from 'ramda';
export const getSrcsetWidths: (srcset: string) => number[] = pipe(
  split(','),
  map(trim),
  map(split(' ')),
  map<readonly string[], string>(last),
  map(parseInt),
);
