import debug from 'debug';
export declare const log: debug.IDebugger;
export declare const createLogger: (module: string) => debug.IDebugger;
export declare const trace: (label?: string | undefined, customLogger?: debug.IDebugger | undefined) => <T>(v: T) => T;
//# sourceMappingURL=log.d.ts.map