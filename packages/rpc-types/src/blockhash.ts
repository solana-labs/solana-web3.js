import {
    combineCodec,
    Decoder,
    Encoder,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    transformEncoder,
} from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH,
    SolanaError,
} from '@solana/errors';

export type Blockhash = string & { readonly __brand: unique symbol };

let memoizedBase58Encoder: Encoder<string> | undefined;
let memoizedBase58Decoder: Decoder<string> | undefined;

function getMemoizedBase58Encoder(): Encoder<string> {
    if (!memoizedBase58Encoder) memoizedBase58Encoder = getBase58Encoder();
    return memoizedBase58Encoder;
}

function getMemoizedBase58Decoder(): Decoder<string> {
    if (!memoizedBase58Decoder) memoizedBase58Decoder = getBase58Decoder();
    return memoizedBase58Decoder;
}

export function isBlockhash(putativeBlockhash: string): putativeBlockhash is Blockhash {
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest value (32 bytes of zeroes)
        putativeBlockhash.length < 32 ||
        // Highest value (32 bytes of 255)
        putativeBlockhash.length > 44
    ) {
        return false;
    }
    // Slow-path; actually attempt to decode the input string.
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeBlockhash);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        return false;
    }
    return true;
}

export function assertIsBlockhash(putativeBlockhash: string): asserts putativeBlockhash is Blockhash {
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest value (32 bytes of zeroes)
        putativeBlockhash.length < 32 ||
        // Highest value (32 bytes of 255)
        putativeBlockhash.length > 44
    ) {
        throw new SolanaError(SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE, {
            actualLength: putativeBlockhash.length,
        });
    }
    // Slow-path; actually attempt to decode the input string.
    const base58Encoder = getMemoizedBase58Encoder();
    const bytes = base58Encoder.encode(putativeBlockhash);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        throw new SolanaError(SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH, {
            actualLength: numBytes,
        });
    }
}

export function blockhash(putativeBlockhash: string): Blockhash {
    assertIsBlockhash(putativeBlockhash);
    return putativeBlockhash as Blockhash;
}

export function getBlockhashEncoder(): FixedSizeEncoder<Blockhash, 32> {
    return transformEncoder(fixEncoderSize(getMemoizedBase58Encoder(), 32), putativeBlockhash =>
        blockhash(putativeBlockhash),
    );
}

export function getBlockhashDecoder(): FixedSizeDecoder<Blockhash, 32> {
    return fixDecoderSize(getMemoizedBase58Decoder(), 32) as FixedSizeDecoder<Blockhash, 32>;
}

export function getBlockhashCodec(): FixedSizeCodec<Blockhash, Blockhash, 32> {
    return combineCodec(getBlockhashEncoder(), getBlockhashDecoder());
}

export function getBlockhashComparator(): (x: string, y: string) => number {
    return new Intl.Collator('en', {
        caseFirst: 'lower',
        ignorePunctuation: false,
        localeMatcher: 'best fit',
        numeric: false,
        sensitivity: 'variant',
        usage: 'sort',
    }).compare;
}
