import {
    assertIsFixedSize,
    createDecoder,
    createEncoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
} from './codec';
import { combineCodec } from './combine-codec';

/**
 * Reverses the bytes of a fixed-size encoder.
 */
export function reverseEncoder<TFrom, TSize extends number>(
    encoder: FixedSizeEncoder<TFrom, TSize>,
): FixedSizeEncoder<TFrom, TSize> {
    try {
        assertIsFixedSize(encoder);
    } catch (e) {
        // TODO: Coded error, also proper catch handling
        throw new Error('Cannot reverse a codec of variable size.');
    }
    return createEncoder({
        ...encoder,
        write: (value: TFrom, bytes, offset) => {
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
export function reverseDecoder<TTo, TSize extends number>(
    decoder: FixedSizeDecoder<TTo, TSize>,
): FixedSizeDecoder<TTo, TSize> {
    try {
        assertIsFixedSize(decoder);
    } catch (e) {
        // TODO: Coded error, also proper catch handling
        throw new Error('Cannot reverse a codec of variable size.');
    }
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
export function reverseCodec<TFrom, TTo extends TFrom, TSize extends number>(
    codec: FixedSizeCodec<TFrom, TTo, TSize>,
): FixedSizeCodec<TFrom, TTo, TSize> {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
