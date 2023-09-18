/* eslint-disable sort-keys-fix/sort-keys-fix */
import { fixBytes } from './bytes';
import { Codec } from './codec';
import { NotEnoughBytesError } from './errors';

/**
 * Creates a fixed-size codec from a given codec.
 *
 * @param codec - The codec to wrap into a fixed-size codec.
 * @param fixedBytes - The fixed number of bytes to read.
 * @param description - A custom description for the codec.
 */
export function fixCodec<T, U extends T = T>(
    codec: Codec<T, U>,
    fixedBytes: number,
    description?: string
): Codec<T, U> {
    return {
        description: description ?? `fixed(${fixedBytes}, ${codec.description})`,
        fixedSize: fixedBytes,
        maxSize: fixedBytes,
        encode: (value: T) => fixBytes(codec.encode(value), fixedBytes),
        decode: (buffer: Uint8Array, offset = 0) => {
            // Slice the buffer to the fixed size.
            buffer = buffer.slice(offset, offset + fixedBytes);
            // Ensure we have enough bytes.
            if (buffer.length < fixedBytes) {
                throw new NotEnoughBytesError('fixCodec', fixedBytes, buffer.length);
            }
            // If the nested codec is fixed-size, pad and truncate the buffer accordingly.
            if (codec.fixedSize !== null) {
                buffer = fixBytes(buffer, codec.fixedSize);
            }
            // Decode the value using the nested codec.
            const [value] = codec.decode(buffer, 0);
            return [value, offset + fixedBytes];
        },
    };
}
