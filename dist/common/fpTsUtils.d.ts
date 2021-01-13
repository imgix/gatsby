import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
/**
 * Type hole to help which constructing applications.
 * More: https://dev.to/gcanti/type-holes-in-typescript-2lck
 */
export declare function _<T>(): T;
/**
 * Convert a TaskEither to a Task composing an Option
 * @param taskEither
 */
export declare const TaskOptionFromTE: <T>(taskEither: TE.TaskEither<any, T>) => T.Task<O.Option<T>>;
/**
 * Helpers to expand any Typescript type.
 * Usage:
 *   1. Add to code: `type Expanded = Expand<TypeToExpand>`
 *   2. Hover over in VSCode
 * Source: https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type
 */
export declare type Expand<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
export declare type ExpandRecursively<T> = T extends object ? T extends infer O ? {
    [K in keyof O]: ExpandRecursively<O[K]>;
} : never : T;
//# sourceMappingURL=fpTsUtils.d.ts.map