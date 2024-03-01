import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type LamportsUnsafeBeyond2Pow53Minus1 = bigint & { readonly __brand: unique symbol };

// Largest possible value to be represented by a u64
const maxU64Value = 18446744073709551615n; // 2n ** 64n - 1n

export function isLamports(putativeLamports: bigint): putativeLamports is LamportsUnsafeBeyond2Pow53Minus1 {
    return putativeLamports >= 0 && putativeLamports <= maxU64Value;
}

export function assertIsLamports(
    putativeLamports: bigint,
): asserts putativeLamports is LamportsUnsafeBeyond2Pow53Minus1 {
    if (putativeLamports < 0 || putativeLamports > maxU64Value) {
        throw new SolanaError(SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE);
    }
}

export function lamports(putativeLamports: bigint): LamportsUnsafeBeyond2Pow53Minus1 {
    assertIsLamports(putativeLamports);
    return putativeLamports;
}
