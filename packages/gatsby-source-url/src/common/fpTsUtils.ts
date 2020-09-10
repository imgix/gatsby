import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
export declare function _<T>(): T;

export const TaskOptionFromTE = <T>(
  taskEither: TE.TaskEither<any, T>,
): T.Task<O.Option<T>> =>
  TE.fold<any, T, O.Option<T>>(
    () => T.of(O.none),
    flow(O.some, T.of),
  )(taskEither);
