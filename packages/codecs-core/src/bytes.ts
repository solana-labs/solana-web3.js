/**
 * Concatenates an array of `Uint8Array`s into a single `Uint8Array`.
 */
export const mergeBytes = (bytesArr: Uint8Array[]): Uint8Array => {
    const totalLength = bytesArr.reduce((total, arr) => total + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    bytesArr.forEach(arr => {
        result.set(arr, offset);
        offset += arr.length;
    });
    return result;
};

/**
 * Pads a `Uint8Array` with zeroes to the specified length.
 * If the array is longer than the specified length, it is returned as-is.
 */
export const padBytes = (bytes: Uint8Array, length: number): Uint8Array => {
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
export const fixBytes = (bytes: Uint8Array, length: number): Uint8Array => padBytes(bytes.slice(0, length), length);
