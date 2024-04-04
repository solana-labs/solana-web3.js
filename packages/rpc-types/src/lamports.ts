import {
    combineCodec,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    transformDecoder,
} from '@solana/codecs-core';
import { getU64Decoder, getU64Encoder } from '@solana/codecs-numbers';
import { SOLANA_ERROR__LAMPORTS_OUT_OF_RANGE, SolanaError } from '@solana/errors';

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type LamportsUnsafeBeyond2Pow53Minus1 = bigint & { readonly __brand: unique symbol };

// Largest possible value to be represented by a u64
const maxU64Value = 18446744073709551615n; // 2n ** 64n - 1n

let memoizedU64Encoder: FixedSizeEncoder<bigint, 8> | undefined;
let memoizedU64Decoder: FixedSizeDecoder<bigint, 8> | undefined;

function getMemoizedU64Encoder(): FixedSizeEncoder<bigint, 8> {
    if (!memoizedU64Encoder) memoizedU64Encoder = getU64Encoder();
    return memoizedU64Encoder;
}

function getMemoizedU64Decoder(): FixedSizeDecoder<bigint, 8> {
    if (!memoizedU64Decoder) memoizedU64Decoder = getU64Decoder();
    return memoizedU64Decoder;
}

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

export function getLamportsEncoder(): FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 8> {
    return getMemoizedU64Encoder();
}

export function getLamportsDecoder(): FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 8> {
    return transformDecoder(getMemoizedU64Decoder(), lamports);
}

export function getLamportsCodec(): FixedSizeCodec<
    LamportsUnsafeBeyond2Pow53Minus1,
    LamportsUnsafeBeyond2Pow53Minus1,
    8
> {
    return combineCodec(getLamportsEncoder(), getLamportsDecoder());
}
