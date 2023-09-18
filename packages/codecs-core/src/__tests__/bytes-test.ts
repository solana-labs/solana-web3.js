import { fixBytes, mergeBytes, padBytes } from '../bytes';

describe('mergeBytes', () => {
    it('can merge multiple arrays of bytes together', () => {
        const merged = mergeBytes([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5]), new Uint8Array([6, 7, 8, 9])]);
        expect(merged).toStrictEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    });
});

describe('padBytes', () => {
    it('can pad an array of bytes to the specified length', () => {
        expect(padBytes(new Uint8Array([1, 2, 3]), 5)).toStrictEqual(new Uint8Array([1, 2, 3, 0, 0]));
        expect(padBytes(new Uint8Array([1, 2, 3]), 2)).toStrictEqual(new Uint8Array([1, 2, 3]));
    });
});

describe('fixBytes', () => {
    it('can fix an array of bytes to the specified length', () => {
        expect(fixBytes(new Uint8Array([1, 2, 3]), 5)).toStrictEqual(new Uint8Array([1, 2, 3, 0, 0]));
        expect(fixBytes(new Uint8Array([1, 2, 3]), 2)).toStrictEqual(new Uint8Array([1, 2]));
    });
});
