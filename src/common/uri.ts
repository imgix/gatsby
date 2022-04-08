import Uri from 'jsuri';

/**
 * Parse the host from a URL. Can throw an error
 */
export const parseHost = (uri: string): string => new URL(uri).hostname;

/**
 * Parse the path from a URL. Can throw an error
 */
export const parsePath = (_uri: string): string => {
  const uri = new Uri(_uri);
  return uri.path() + uri.query() + (uri.anchor() ? `#${uri.anchor()}` : '');
};
