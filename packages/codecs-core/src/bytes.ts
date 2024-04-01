import { ReadonlyUint8Array } from './readonly-uint8array';

/**
 * Concatenates an array of `Uint8Array`s into a single `Uint8Array`.
 * Reuses the original byte array when applicable.
 */
export const mergeBytes = (byteArrays: Uint8Array[]): Uint8Array => {
    const nonEmptyByteArrays = byteArrays.filter(arr => arr.length);
    if (nonEmptyByteArrays.length === 0) {
        return byteArrays.length ? byteArrays[0] : new Uint8Array();
    }

    if (nonEmptyByteArrays.length === 1) {
        return nonEmptyByteArrays[0];
    }

    const totalLength = nonEmptyByteArrays.reduce((total, arr) => total + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    nonEmptyByteArrays.forEach(arr => {
        result.set(arr, offset);
        offset += arr.length;
    });
    return result;
};

/**
 * Pads a `Uint8Array` with zeroes to the specified length.
 * If the array is longer than the specified length, it is returned as-is.
 */
export const padBytes = (bytes: ReadonlyUint8Array | Uint8Array, length: number): ReadonlyUint8Array | Uint8Array => {
    if (bytes.length >= length) return bytes;
    const paddedBytes = new Uint8Array(length).fill(0);
    paddedBytes.set(bytes);
    return paddedBytes;
};

/**
 * Fixes a `Uint8Array` to the specified length.
 * If the array is longer than the specified length, it is truncated.
 * If the array is shorter than the specified length, it is padded with zeroes.
 */
export const fixBytes = (bytes: ReadonlyUint8Array | Uint8Array, length: number): ReadonlyUint8Array | Uint8Array =>
    padBytes(bytes.length <= length ? bytes : bytes.slice(0, length), length);

/**
 * Returns true if and only if the provided `data` byte array contains
 * the provided `bytes` byte array at the specified `offset`.
 */
export function containsBytes(
    data: ReadonlyUint8Array | Uint8Array,
    bytes: ReadonlyUint8Array | Uint8Array,
    offset: number,
): boolean {
    const slice = offset === 0 && data.length === bytes.length ? data : data.slice(offset, offset + bytes.length);
    if (slice.length !== bytes.length) return false;
    return bytes.every((b, i) => b === slice[i]);
}
