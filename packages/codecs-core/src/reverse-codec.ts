import { assertFixedSizeCodec } from './assertions';
import { createDecoder, createEncoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from './codec';
import { combineCodec } from './combine-codec';

/**
 * Reverses the bytes of a fixed-size encoder.
 */
export function reverseEncoder<T>(encoder: FixedSizeEncoder<T>): FixedSizeEncoder<T> {
    assertFixedSizeCodec(encoder, 'Cannot reverse a codec of variable size.');
    return createEncoder({
        ...encoder,
        write: (value: T, bytes, offset) => {
            const newOffset = encoder.write(value, bytes, offset);
            const slice = bytes.slice(offset, offset + encoder.fixedSize).reverse();
            bytes.set(slice, offset);
            return newOffset;
        },
    });
}

/**
 * Reverses the bytes of a fixed-size decoder.
 */
export function reverseDecoder<T>(decoder: FixedSizeDecoder<T>): FixedSizeDecoder<T> {
    assertFixedSizeCodec(decoder, 'Cannot reverse a codec of variable size.');
    return createDecoder({
        ...decoder,
        read: (bytes, offset) => {
            const reverseEnd = offset + decoder.fixedSize;
            if (offset === 0 && bytes.length === reverseEnd) {
                return decoder.read(bytes.reverse(), offset);
            }
            const reversedBytes = bytes.slice();
            reversedBytes.set(bytes.slice(offset, reverseEnd).reverse(), offset);
            return decoder.read(reversedBytes, offset);
        },
    });
}

/**
 * Reverses the bytes of a fixed-size codec.
 */
export function reverseCodec<T, U extends T = T>(codec: FixedSizeCodec<T, U>): FixedSizeCodec<T, U> {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
