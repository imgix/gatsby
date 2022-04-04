import { GatsbyCache } from 'gatsby';
import { createLogger, traceJSON } from './log';

const log = createLogger('cache');

export const withCache = async <TData>(
  key: string,
  cache: GatsbyCache,
  f: () => Promise<TData>,
): Promise<TData> => {
  try {
    log(`Trying to retrieve ${key} from cache`);
    const data = await getFromCache<TData>(cache, key);
    traceJSON(data, `Successfully retrieved ${key} from cache with value`, log);
    return data;
  } catch (error) {
    const newData = await f();
    traceJSON(
      newData,
      `Couldn't retrieve ${key} from cache, replacing with value`,
    );

    try {
      await setToCache(cache, key, newData);
    } catch (error) {
      throw new Error('Error with cache');
    }

    return newData;
  }
};

export const getFromCache = async <A>(
  cache: GatsbyCache,
  key: string,
): Promise<A> => {
  let cacheData;
  try {
    cacheData = (await cache.get(key)) as A | undefined | null;
  } catch (error) {
    throw new Error(`Failed to get "${key}" in cache.`);
  }

  traceJSON(cacheData, `Retrieved value from cache for ${key}`, log);
  if (cacheData == null) {
    log(`Key ${key} doesn't exist in the cache`);
    throw new Error(`Key ${key} doesn't exist in the cache`);
  }
  return cacheData;
};

export const setToCache = async <TData>(
  cache: GatsbyCache,
  key: string,
  value: TData,
): Promise<void> => {
  traceJSON(value, `Setting "${key}" in cache to`, log);
  try {
    cache.set(key, value).then(() => value);
    log(`Cached value`);
  } catch (error) {
    traceJSON(value, `Failed to set "${key}" in cache to`, log);
    throw new Error(`Failed to set "${key}" in cache to value: ${value}`);
  }
};
