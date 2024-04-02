import { assertByteArrayHasEnoughBytesForCodec } from './assertions';
import { fixBytes } from './bytes';
import {
    Codec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSize,
    Offset,
} from './codec';
import { combineCodec } from './combine-codec';

/**
 * Creates a fixed-size encoder from a given encoder.
 *
 * @param encoder - The encoder to wrap into a fixed-size encoder.
 * @param fixedBytes - The fixed number of bytes to write.
 */
export function fixEncoderSize<TFrom, TSize extends number>(
    encoder: Encoder<TFrom>,
    fixedBytes: TSize,
): FixedSizeEncoder<TFrom, TSize> {
    return createEncoder({
        fixedSize: fixedBytes,
        write: (value: TFrom, bytes: Uint8Array, offset: Offset) => {
            // Here we exceptionally use the `encode` function instead of the `write`
            // function as using the nested `write` function on a fixed-sized byte
            // array may result in a out-of-bounds error on the nested encoder.
            const variableByteArray = encoder.encode(value);
            const fixedByteArray =
                variableByteArray.length > fixedBytes ? variableByteArray.slice(0, fixedBytes) : variableByteArray;
            bytes.set(fixedByteArray, offset);
            return offset + fixedBytes;
        },
    });
}

/**
 * Creates a fixed-size decoder from a given decoder.
 *
 * @param decoder - The decoder to wrap into a fixed-size decoder.
 * @param fixedBytes - The fixed number of bytes to read.
 */
export function fixDecoderSize<TTo, TSize extends number>(
    decoder: Decoder<TTo>,
    fixedBytes: TSize,
): FixedSizeDecoder<TTo, TSize> {
    return createDecoder({
        fixedSize: fixedBytes,
        read: (bytes, offset) => {
            assertByteArrayHasEnoughBytesForCodec('fixCodecSize', fixedBytes, bytes, offset);
            // Slice the byte array to the fixed size if necessary.
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            // If the nested decoder is fixed-size, pad and truncate the byte array accordingly.
            if (isFixedSize(decoder)) {
                bytes = fixBytes(bytes, decoder.fixedSize);
            }
            // Decode the value using the nested decoder.
            const [value] = decoder.read(bytes, 0);
            return [value, offset + fixedBytes];
        },
    });
}

/**
 * Creates a fixed-size codec from a given codec.
 *
 * @param codec - The codec to wrap into a fixed-size codec.
 * @param fixedBytes - The fixed number of bytes to read/write.
 */
export function fixCodecSize<TFrom, TTo extends TFrom, TSize extends number>(
    codec: Codec<TFrom, TTo>,
    fixedBytes: TSize,
): FixedSizeCodec<TFrom, TTo, TSize> {
    return combineCodec(fixEncoderSize(codec, fixedBytes), fixDecoderSize(codec, fixedBytes));
}
