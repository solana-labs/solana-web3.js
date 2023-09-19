import { getBase10Codec } from '../base10';

describe('getBase10Codec', () => {
    it('can encode base 10 strings', () => {
        const base10 = getBase10Codec();

        expect(base10.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base10.decode(new Uint8Array([]))).toStrictEqual(['', 0]);

        expect(base10.encode('0')).toStrictEqual(new Uint8Array([0]));
        expect(base10.decode(new Uint8Array([0]))).toStrictEqual(['0', 1]);

        expect(base10.encode('000')).toStrictEqual(new Uint8Array([0, 0, 0]));
        expect(base10.decode(new Uint8Array([0, 0, 0]))).toStrictEqual(['000', 3]);

        expect(base10.encode('1')).toStrictEqual(new Uint8Array([1]));
        expect(base10.decode(new Uint8Array([1]))).toStrictEqual(['1', 1]);

        expect(base10.encode('42')).toStrictEqual(new Uint8Array([42]));
        expect(base10.decode(new Uint8Array([42]))).toStrictEqual(['42', 1]);

        expect(base10.encode('1024')).toStrictEqual(new Uint8Array([4, 0]));
        expect(base10.decode(new Uint8Array([4, 0]))).toStrictEqual(['1024', 2]);

        expect(base10.encode('65535')).toStrictEqual(new Uint8Array([255, 255]));
        expect(base10.decode(new Uint8Array([255, 255]))).toStrictEqual(['65535', 2]);

        expect(() => base10.encode('INVALID_INPUT')).toThrow('Expected a string of base 10, got [INVALID_INPUT].');
    });
});
