/* eslint-disable sort-keys-fix/sort-keys-fix */
import { mergeBytes } from './bytes';
import { Codec } from './codec';
import { ExpectedFixedSizeCodecError } from './errors';

/**
 * Reverses the bytes of a fixed-size codec.
 */
export function reverseCodec<T, U extends T = T>(codec: Codec<T, U>): Codec<T, U> {
    const fixedSize = codec.fixedSize;
    if (fixedSize === null) {
        throw new ExpectedFixedSizeCodecError('Cannot reverse a codec of variable size.');
    }
    return {
        ...codec,
        encode: (value: T) => codec.encode(value).reverse(),
        decode: (bytes: Uint8Array, offset = 0) => {
            const newBytes = mergeBytes([
                bytes.slice(0, offset),
                bytes.slice(offset, offset + fixedSize).reverse(),
                bytes.slice(offset + fixedSize),
            ]);
            return codec.decode(newBytes, offset);
        },
    };
}
