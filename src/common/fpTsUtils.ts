import { flow } from 'fp-ts/lib/function';
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
export const TaskOptionFromTE = <T>(
  taskEither: TE.TaskEither<any, T>,
): T.Task<O.Option<T>> =>
  TE.fold<any, T, O.Option<T>>(
    () => T.of(O.none),
    flow(O.some, T.of),
  )(taskEither);

/**
 * Helper to expand any Typescript type.
 * Usage:
 *   1. Add to code: `type Expanded = Expand<TypeToExpand>`
 *   2. Hover over in VSCode
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
