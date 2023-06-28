import { base58 } from '@metaplex-foundation/umi-serializers-encodings';

export type Blockhash = string & { readonly __blockhash: unique symbol };

export function assertIsBlockhash(putativeBlockhash: string): asserts putativeBlockhash is Blockhash {
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
        const bytes = base58.serialize(putativeBlockhash);
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
