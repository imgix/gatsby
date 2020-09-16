import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { Optional } from './tsUtils';

const typeOptional = <P extends t.Props>(obj: P) =>
  pipe(obj, (v) => t.type<P>(v), fixOptionals);

/**
 * Type lambda returning a union of key names from input type P having type A
 */
type FieldsWithType<T, Type> = {
  [K in keyof T]-?: Type extends T[K] ? K : never;
}[keyof T];

/**
 * Dual for FieldsWith - returns the rest of the fields
 */
type FieldsWithoutType<T, Type> = Exclude<keyof T, FieldsWithType<T, Type>>;

// Original implementation
// type MakeOptional<T, Type = undefined> = Pick<T, FieldsWithoutType<T, Type>> & Partial<Pick<T, FieldsWithType<T, Type>>>;

/**
 * Type lambda returning new type with all fields within P having type U marked as optional
 */
type MakeOptional<T, Type = undefined> = Optional<T, FieldsWithType<T, Type>>;

/**
 * Fix signature by marking all fields with undefined as optional
 */
const fixOptionals = <C extends t.Mixed>(
  c: C,
): t.Type<MakeOptional<t.TypeOf<C>>, t.OutputOf<C>, t.InputOf<C>> => c;

/**
 * Just an alias for T | undefined coded
 */
const optional = <C extends t.Mixed>(
  c: C,
): t.Type<t.TypeOf<C> | undefined, t.OutputOf<C>, t.InputOf<C>> =>
  t.union([t.undefined, c]);

export * from 'io-ts';
export { typeOptional, optional };
