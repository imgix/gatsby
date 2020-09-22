import { curry } from 'ramda';

export const roundToDP = curry(
  (dp: number, num: number): number =>
    Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp),
);
