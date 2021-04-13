import * as E from 'fp-ts/lib/Either';
import Uri from 'jsuri';

/**
 * Parse the host from a URL. Can fail - for an FP type, use parseHostE
 */
export const parseHost = (uri: string): string => new URL(uri).hostname;
export const parseHostE = (uri: string) =>
  E.tryCatch(
    () => parseHost(uri),
    () => new Error('Invalid URL'),
  );

/**
 * Parse the path from a URL. Can fail - for an FP type, use parsePathE
 */
export const parsePath = (uri: string): string => new Uri(uri).path();
export const parsePathE = (uri: string) =>
  E.tryCatch(
    () => parsePath(uri),
    () => new Error('Invalid URL'),
  );
