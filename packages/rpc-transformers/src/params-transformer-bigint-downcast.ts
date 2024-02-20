export function downcastNodeToNumberIfBigint(value: bigint): number;
export function downcastNodeToNumberIfBigint<T>(value: T): T;
export function downcastNodeToNumberIfBigint(value: unknown): unknown {
    return typeof value === 'bigint'
        ? // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
          // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
          // downcasting `bigints` to `numbers`.
          Number(value)
        : value;
}
