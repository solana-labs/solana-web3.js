import type { Encoder } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';

export type Blockhash = string & { readonly __brand: unique symbol };

let base58Encoder: Encoder<string> | undefined;

export function assertIsBlockhash(putativeBlockhash: string): asserts putativeBlockhash is Blockhash {
    if (!base58Encoder) base58Encoder = getBase58Encoder();
    try {
        // Fast-path; see if the input string is of an acceptable length.
        if (
            // Lowest value (32 bytes of zeroes)
            putativeBlockhash.length < 32 ||
            // Highest value (32 bytes of 255)
            putativeBlockhash.length > 44
        ) {
            throw new Error('Expected input string to decode to a byte array of length 32.');
        }
        // Slow-path; actually attempt to decode the input string.
        const bytes = base58Encoder.encode(putativeBlockhash);
        const numBytes = bytes.byteLength;
        if (numBytes !== 32) {
            throw new Error(`Expected input string to decode to a byte array of length 32. Actual length: ${numBytes}`);
        }
    } catch (e) {
        throw new Error(`\`${putativeBlockhash}\` is not a blockhash`, {
            cause: e,
        });
    }
}
