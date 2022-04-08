import debug from 'debug';

const ns = 'imgix:gatsby';

/**
 * Log a message in the @imgix/gatsby namespace
 */
export const log = debug(ns);
/**
 * Create a custom logger to group logs by a namespace.
 * @param module The namespace to use for the logger
 */
export const createLogger = (module: string) => debug(`${ns}:${module}`);

/**
 * Create a tracer (function that can be used to log a message)
 * @param label A prefix to add to the message
 * @param logger Custom debug logger to use if needed
 * @returns A function that takes a message to log
 */
export const trace = (label?: string, customLogger?: debug.IDebugger) => <T>(
  v: T,
) => {
  (customLogger ?? log)(
    `${label ? `${label}: ` : ''}${JSON.stringify(v, null, 2)}`,
  );
  return v;
};

/**
 * Log out a JSON value.
 * @param rawJSON JSON data to lo
 * @param label Prefix to add to log message
 * @param customLogger Custom debug logger to use if created
 */
export const traceJSON = (
  rawJSON: any,
  label?: string | null | undefined,
  customLogger?: debug.IDebugger,
) => {
  const logger = customLogger ?? log;
  const prefix = label ? `${label}: ` : '';
  const formattedMessage = JSON.stringify(rawJSON, null, 2);
  logger(`${prefix}${formattedMessage}`);
};
