import * as t from 'io-ts';
import { Optional } from './tsUtils';
declare const typeOptional: <P extends t.Props>(obj: P, name?: string | undefined) => t.Type<Optional<{ [K in keyof P]: t.TypeOf<P[K]>; }, FieldsWithType<{ [K in keyof P]: t.TypeOf<P[K]>; }, undefined>>, { [K_1 in keyof P]: t.OutputOf<P[K_1]>; }, unknown>;
/**
 * Type lambda returning a union of key names from input type P having type A
 */
declare type FieldsWithType<T, Type> = {
    [K in keyof T]-?: Type extends T[K] ? K : never;
}[keyof T];
/**
 * Just an alias for T | undefined coded
 */
declare const optional: <C extends t.Mixed>(c: C) => t.Type<t.TypeOf<C> | undefined, t.OutputOf<C>, t.InputOf<C>>;
export declare function fromEnum<EnumType extends string>(enumName: string, theEnum: Record<string, EnumType>): t.Type<EnumType, EnumType, unknown>;
export * from 'io-ts';
export { typeOptional, optional };
//# sourceMappingURL=ioTs.d.ts.map