import * as R from 'ramda';
export const getSrcsetWidths: (srcset: string) => number[] = R.pipe(
  R.split(','),
  R.map(R.trim),
  R.map(R.split(' ')),
  R.map<readonly string[], string>(R.last),
  R.map(parseInt),
);
