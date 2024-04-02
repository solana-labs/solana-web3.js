import {
    SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY,
    SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { ReadonlyUint8Array } from './readonly-uint8array';

/**
 * Asserts that a given byte array is not empty.
 */
export function assertByteArrayIsNotEmptyForCodec(
    codecDescription: string,
    bytes: ReadonlyUint8Array | Uint8Array,
    offset = 0,
) {
    if (bytes.length - offset <= 0) {
        throw new SolanaError(SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY, {
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
    bytes: ReadonlyUint8Array | Uint8Array,
    offset = 0,
) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
            bytesLength,
            codecDescription,
            expected,
        });
    }
}

/**
 * Asserts that a given offset is within the byte array bounds.
 * This range is between 0 and the byte array length and is inclusive.
 * An offset equals to the byte array length is considered a valid offset
 * as it allows the post-offset of codecs to signal the end of the byte array.
 */
export function assertByteArrayOffsetIsNotOutOfRange(codecDescription: string, offset: number, bytesLength: number) {
    if (offset < 0 || offset > bytesLength) {
        throw new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
            bytesLength,
            codecDescription,
            offset,
        });
    }
}
