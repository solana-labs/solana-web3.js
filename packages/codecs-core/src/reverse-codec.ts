import { assertFixedSizeCodec } from './assertions';
import { mergeBytes } from './bytes';
import { Codec, Decoder, Encoder } from './codec';
import { combineCodec } from './combine-codec';

/**
 * Reverses the bytes of a fixed-size encoder.
 */
export function reverseEncoder<T>(encoder: Encoder<T>): Encoder<T> {
    assertFixedSizeCodec(encoder, 'Cannot reverse a codec of variable size.');
    return {
        ...encoder,
        encode: (value: T) => encoder.encode(value).reverse(),
    };
}

/**
 * Reverses the bytes of a fixed-size decoder.
 */
export function reverseDecoder<T>(decoder: Decoder<T>): Decoder<T> {
    assertFixedSizeCodec(decoder, 'Cannot reverse a codec of variable size.');
    return {
        ...decoder,
        decode: (bytes: Uint8Array, offset = 0) => {
            const newBytes = mergeBytes([
                bytes.slice(0, offset),
                bytes.slice(offset, offset + decoder.fixedSize).reverse(),
                bytes.slice(offset + decoder.fixedSize),
            ]);
            return decoder.decode(newBytes, offset);
        },
    };
}

/**
 * Reverses the bytes of a fixed-size codec.
 */
export function reverseCodec<T, U extends T = T>(codec: Codec<T, U>): Codec<T, U> {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
