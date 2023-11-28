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
    isFixedSizeCodec,
    Offset,
} from './codec';
import { combineCodec } from './combine-codec';

/**
 * Creates a fixed-size encoder from a given encoder.
 *
 * @param encoder - The encoder to wrap into a fixed-size encoder.
 * @param fixedBytes - The fixed number of bytes to write.
 * @param description - A custom description for the encoder.
 */
export function fixEncoder<T>(encoder: Encoder<T>, fixedBytes: number): FixedSizeEncoder<T> {
    return createEncoder({
        fixedSize: fixedBytes,
        write: (value: T, bytes: Uint8Array, offset: Offset) => {
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
 * @param description - A custom description for the decoder.
 */
export function fixDecoder<T>(decoder: Decoder<T>, fixedBytes: number): FixedSizeDecoder<T> {
    return createDecoder({
        fixedSize: fixedBytes,
        read: (bytes: Uint8Array, offset: Offset) => {
            assertByteArrayHasEnoughBytesForCodec('fixCodec', fixedBytes, bytes, offset);
            // Slice the byte array to the fixed size if necessary.
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            // If the nested decoder is fixed-size, pad and truncate the byte array accordingly.
            if (isFixedSizeCodec(decoder)) {
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
 * @param description - A custom description for the codec.
 */
export function fixCodec<T, U extends T = T>(codec: Codec<T, U>, fixedBytes: number): FixedSizeCodec<T, U> {
    return combineCodec(fixEncoder(codec, fixedBytes), fixDecoder(codec, fixedBytes));
}
