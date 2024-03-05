import {
    SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY,
    SOLANA_ERROR__CODECS_INVALID_BYTE_LENGTH,
    SolanaError,
} from '@solana/errors';

/**
 * Asserts that a given byte array is not empty.
 */
export function assertByteArrayIsNotEmptyForCodec(codecDescription: string, bytes: Uint8Array, offset = 0) {
    if (bytes.length - offset <= 0) {
        throw new SolanaError(SOLANA_ERROR__CODECS_CANNOT_DECODE_EMPTY_BYTE_ARRAY, {
            codecDescription,
        });
    }
}

/**
 * Asserts that a given byte array has enough bytes to decode.
 */
export function assertByteArrayHasEnoughBytesForCodec(
    codecDescription: string,
    expected: number,
    bytes: Uint8Array,
    offset = 0,
) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        throw new SolanaError(SOLANA_ERROR__CODECS_INVALID_BYTE_LENGTH, {
            bytesLength,
            codecDescription,
            expected,
        });
    }
}
