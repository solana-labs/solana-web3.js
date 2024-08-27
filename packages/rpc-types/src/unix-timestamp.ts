import { SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE, SolanaError } from '@solana/errors';

export type UnixTimestampUnsafeBeyond2Pow53Minus1 = bigint & { readonly __brand: unique symbol };

// Largest possible value to be represented by an i64
const maxI64Value = 9223372036854775807n; // 2n ** 63n - 1n
const minI64Value = -9223372036854775808n; // -(2n ** 63n)

export function isUnixTimestamp(putativeTimestamp: bigint): putativeTimestamp is UnixTimestampUnsafeBeyond2Pow53Minus1 {
    return putativeTimestamp >= minI64Value && putativeTimestamp <= maxI64Value;
}

export function assertIsUnixTimestamp(
    putativeTimestamp: bigint,
): asserts putativeTimestamp is UnixTimestampUnsafeBeyond2Pow53Minus1 {
    if (putativeTimestamp < minI64Value || putativeTimestamp > maxI64Value) {
        throw new SolanaError(SOLANA_ERROR__TIMESTAMP_OUT_OF_RANGE, {
            value: putativeTimestamp,
        });
    }
}

export function unixTimestamp(putativeTimestamp: bigint): UnixTimestampUnsafeBeyond2Pow53Minus1 {
    assertIsUnixTimestamp(putativeTimestamp);
    return putativeTimestamp;
}
