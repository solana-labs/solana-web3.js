import stringify from '@solana/fast-stable-stringify';

export const cacheKeyFn = (obj: unknown) => stringify(obj) ?? '';
