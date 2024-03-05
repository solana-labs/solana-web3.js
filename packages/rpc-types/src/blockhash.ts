import type { Encoder } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH,
    SolanaError,
} from '@solana/errors';

export type Blockhash = string & { readonly __brand: unique symbol };

let base58Encoder: Encoder<string> | undefined;

export function assertIsBlockhash(putativeBlockhash: string): asserts putativeBlockhash is Blockhash {
    if (!base58Encoder) base58Encoder = getBase58Encoder();
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
    const bytes = base58Encoder.encode(putativeBlockhash);
    const numBytes = bytes.byteLength;
    if (numBytes !== 32) {
        throw new SolanaError(SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH, {
            actualLength: numBytes,
        });
    }
}
