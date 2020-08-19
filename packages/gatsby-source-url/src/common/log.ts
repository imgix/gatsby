import debug from 'debug';

const ns = 'imgix:gatsby-source-url';
export const log = debug(ns);
export const createLogger = (module: string) => debug(`${ns}:${module}`);

export const trace = (label?: string, customLogger?: debug.IDebugger) => <T>(
  v: T,
) => {
  (customLogger ?? log)(
    `${label ? `${label}: ` : ''}${JSON.stringify(v, null, 2)}`,
  );
  return v;
};
