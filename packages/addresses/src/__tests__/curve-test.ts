import { compressedPointBytesAreOnCurve } from '../curve';

const OFF_CURVE_KEY_BYTES = [
    new Uint8Array([
        0, 121, 240, 130, 166, 28, 199, 78, 165, 226, 171, 237, 100, 187, 247, 95, 50, 251, 221, 83, 122, 255, 247, 82,
        87, 237, 103, 22, 201, 227, 114, 153,
    ]),
    new Uint8Array([
        194, 222, 197, 61, 68, 225, 252, 198, 155, 150, 247, 44, 45, 10, 115, 8, 12, 50, 138, 12, 106, 199, 75, 172,
        159, 87, 94, 122, 251, 246, 136, 75,
    ]),
];
const ON_CURVE_KEY_BYTES = [
    new Uint8Array([
        107, 141, 87, 175, 101, 27, 216, 58, 238, 95, 193, 175, 21, 151, 207, 102, 28, 107, 157, 178, 69, 77, 203, 89,
        199, 77, 162, 19, 27, 108, 57, 155,
    ]),
    new Uint8Array([
        52, 94, 161, 109, 55, 62, 164, 12, 183, 165, 56, 112, 86, 103, 19, 109, 196, 33, 93, 42, 143, 6, 221, 172, 173,
        21, 130, 96, 170, 101, 82, 200,
    ]),
];

describe('compressedPointBytesAreOnCurve', () => {
    it.each(OFF_CURVE_KEY_BYTES)('returns false when a public key does not lie on the Ed25519 curve [%#]', bytes => {
        expect(compressedPointBytesAreOnCurve(bytes)).toBe(false);
    });
    it.each(ON_CURVE_KEY_BYTES)('returns true when a public key lies on the Ed25519 curve [%#]', bytes => {
        expect(compressedPointBytesAreOnCurve(bytes)).toBe(true);
    });
});
