import { CodecData } from './codec';

/**
 * Asserts that a given byte array is not empty.
 */
export function assertByteArrayIsNotEmptyForCodec(codecDescription: string, bytes: Uint8Array, offset = 0) {
    if (bytes.length - offset <= 0) {
        // TODO: Coded error.
        throw new Error(`Codec [${codecDescription}] cannot decode empty byte arrays.`);
    }
}

/**
 * Asserts that a given byte array has enough bytes to decode.
 */
export function assertByteArrayHasEnoughBytesForCodec(
    codecDescription: string,
    expected: number,
    bytes: Uint8Array,
    offset = 0
) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        // TODO: Coded error.
        throw new Error(`Codec [${codecDescription}] expected ${expected} bytes, got ${bytesLength}.`);
    }
}

/**
 * Asserts that a given codec is fixed-size codec.
 */
export function assertFixedSizeCodec(
    data: Pick<CodecData, 'fixedSize'>,
    message?: string
): asserts data is { fixedSize: number } {
    if (data.fixedSize === null) {
        // TODO: Coded error.
        throw new Error(message ?? 'Expected a fixed-size codec, got a variable-size one.');
    }
}
