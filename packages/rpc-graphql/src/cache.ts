export interface GraphQLCache {
    flush(): void;
    get(key: string | bigint, variables: unknown): unknown | null;
    insert(key: string | bigint, variables: unknown, value: unknown): void;
}

// Basic in-memory cache for Node.js
const inMemoryCache: { [key: string]: string } = {};

const stringifyValue = (value: unknown) =>
    JSON.stringify(value, (_, value) => {
        if (typeof value === 'bigint') {
            return value.toString() + 'n';
        }
        return value;
    });

const parseValue = (value: string) =>
    JSON.parse(value, (_, value) => {
        if (typeof value === 'string' && /\d+n$/.test(value)) {
            return BigInt(value.slice(0, -1));
        }
        return value;
    });

const cacheKey = (key: string | bigint, variables: unknown): string =>
    `GraphQLCache:${stringifyValue(key)}:${stringifyValue(variables)}`;

export function createGraphQLCache(): GraphQLCache {
    return __BROWSER__
        ? {
              // Browser
              flush: () => {
                  // Clear all entries from the localStorage related to this cache
                  for (let i = localStorage.length - 1; i >= 0; i--) {
                      const storageKey = localStorage.key(i);
                      if (storageKey && storageKey.startsWith('GraphQLCache:')) {
                          localStorage.removeItem(storageKey);
                      }
                  }
              },
              get: (key, variables) => {
                  const value = localStorage.getItem(cacheKey(key, variables));
                  return value === null ? null : parseValue(value);
              },
              insert: (key, variables, value) => {
                  localStorage.setItem(cacheKey(key, variables), stringifyValue(value));
              },
          }
        : {
              // Node.js
              flush: () => {
                  Object.keys(inMemoryCache).forEach(key => delete inMemoryCache[key]);
              },
              get: (key, variables) => {
                  const value = inMemoryCache[cacheKey(key, variables)];
                  return value === undefined ? null : parseValue(value);
              },
              insert: (key, variables, value) => {
                  inMemoryCache[cacheKey(key, variables)] = stringifyValue(value);
              },
          };
}
