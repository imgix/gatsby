import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
export declare function _<T>(): T;
export declare const TaskOptionFromTE: <T>(taskEither: TE.TaskEither<any, T>) => T.Task<O.Option<T>>;
//# sourceMappingURL=fpTsUtils.d.ts.map