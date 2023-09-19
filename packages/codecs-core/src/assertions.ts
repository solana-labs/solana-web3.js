import { CodecData } from './codec';
import { DecodingEmptyBufferError, ExpectedFixedSizeCodecError, NotEnoughBytesToDecodeError } from './errors';

/**
 * Asserts that a given buffer is not empty.
 */
export function assertDecodedBufferIsNotEmpty(codecName: string, buffer: Uint8Array) {
    if (buffer.length === 0) {
        throw new DecodingEmptyBufferError(codecName);
    }
}

/**
 * Asserts that a given buffer has enough bytes to decode.
 */
export function assertDecodedBufferHasEnoughBytes(codecName: string, buffer: Uint8Array, expected: number) {
    if (buffer.length < expected) {
        throw new NotEnoughBytesToDecodeError(codecName, expected, buffer.length);
    }
}

/**
 * Asserts that a given codec is fixed-size codec.
 */
export function assertFixedSizeCodec(
    data: Pick<CodecData, 'fixedSize'>,
    message?: string
): asserts data is { fixedSize: number } {
    const fixedSize = data.fixedSize;
    if (fixedSize === null) {
        throw new ExpectedFixedSizeCodecError(message);
    }
}
