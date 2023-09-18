/* eslint-disable sort-keys-fix/sort-keys-fix */
import { mergeBytes } from './bytes';
import { Codec, CodecData, Decoder, Encoder } from './codec';
import { ExpectedFixedSizeCodecError } from './errors';
import { joinEncoderAndDecoder } from './joinEncoderAndDecoder';

function assertFixedSize(data: CodecData): asserts data is CodecData & { fixedSize: number } {
    const fixedSize = data.fixedSize;
    if (fixedSize === null) {
        throw new ExpectedFixedSizeCodecError('Cannot reverse a codec of variable size.');
    }
}

/**
 * Reverses the bytes of a fixed-size encoder.
 */
export function reverseEncoder<T>(encoder: Encoder<T>): Encoder<T> {
    assertFixedSize(encoder);
    return {
        ...encoder,
        encode: (value: T) => encoder.encode(value).reverse(),
    };
}

/**
 * Reverses the bytes of a fixed-size decoder.
 */
export function reverseDecoder<T>(decoder: Decoder<T>): Decoder<T> {
    assertFixedSize(decoder);
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
    return joinEncoderAndDecoder(reverseEncoder(codec), reverseDecoder(codec));
}
