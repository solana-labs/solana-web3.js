import { assertByteArrayHasEnoughBytesForCodec } from './assertions';
import { fixBytes } from './bytes';
import { Codec, CodecData, Decoder, Encoder } from './codec';
import { combineCodec } from './combine-codec';

function fixCodecHelper(data: CodecData, fixedBytes: number, description?: string): CodecData {
    return {
        description: description ?? `fixed(${fixedBytes}, ${data.description})`,
        fixedSize: fixedBytes,
        maxSize: fixedBytes,
    };
}

/**
 * Creates a fixed-size encoder from a given encoder.
 *
 * @param encoder - The encoder to wrap into a fixed-size encoder.
 * @param fixedBytes - The fixed number of bytes to write.
 * @param description - A custom description for the encoder.
 */
export function fixEncoder<T>(encoder: Encoder<T>, fixedBytes: number, description?: string): Encoder<T> {
    return {
        ...fixCodecHelper(encoder, fixedBytes, description),
        encode: (value: T) => fixBytes(encoder.encode(value), fixedBytes),
    };
}

/**
 * Creates a fixed-size decoder from a given decoder.
 *
 * @param decoder - The decoder to wrap into a fixed-size decoder.
 * @param fixedBytes - The fixed number of bytes to read.
 * @param description - A custom description for the decoder.
 */
export function fixDecoder<T>(decoder: Decoder<T>, fixedBytes: number, description?: string): Decoder<T> {
    return {
        ...fixCodecHelper(decoder, fixedBytes, description),
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayHasEnoughBytesForCodec('fixCodec', fixedBytes, bytes, offset);
            // Slice the byte array to the fixed size if necessary.
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            // If the nested decoder is fixed-size, pad and truncate the byte array accordingly.
            if (decoder.fixedSize !== null) {
                bytes = fixBytes(bytes, decoder.fixedSize);
            }
            // Decode the value using the nested decoder.
            const [value] = decoder.decode(bytes, 0);
            return [value, offset + fixedBytes];
        },
    };
}

/**
 * Creates a fixed-size codec from a given codec.
 *
 * @param codec - The codec to wrap into a fixed-size codec.
 * @param fixedBytes - The fixed number of bytes to read/write.
 * @param description - A custom description for the codec.
 */
export function fixCodec<T, U extends T = T>(
    codec: Codec<T, U>,
    fixedBytes: number,
    description?: string
): Codec<T, U> {
    return combineCodec(fixEncoder(codec, fixedBytes, description), fixDecoder(codec, fixedBytes, description));
}
