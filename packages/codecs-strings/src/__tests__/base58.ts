import { getBase58Codec } from '../base58';

describe('getBase58Codec', () => {
    it('can encode base 58 strings', () => {
        const base58 = getBase58Codec();

        expect(base58.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base58.decode(new Uint8Array([]))).toStrictEqual(['', 0]);

        expect(base58.encode('1')).toStrictEqual(new Uint8Array([0]));
        expect(base58.decode(new Uint8Array([0]))).toStrictEqual(['1', 1]);

        expect(base58.encode('2')).toStrictEqual(new Uint8Array([1]));
        expect(base58.decode(new Uint8Array([1]))).toStrictEqual(['2', 1]);

        expect(base58.encode('11')).toStrictEqual(new Uint8Array([0, 0]));
        expect(base58.decode(new Uint8Array([0, 0]))).toStrictEqual(['11', 2]);

        const zeroes32 = new Uint8Array(Array(32).fill(0));
        expect(base58.encode('1'.repeat(32))).toStrictEqual(zeroes32);
        expect(base58.decode(zeroes32)).toStrictEqual(['1'.repeat(32), 32]);

        expect(base58.encode('j')).toStrictEqual(new Uint8Array([42]));
        expect(base58.decode(new Uint8Array([42]))).toStrictEqual(['j', 1]);

        expect(base58.encode('Jf')).toStrictEqual(new Uint8Array([4, 0]));
        expect(base58.decode(new Uint8Array([4, 0]))).toStrictEqual(['Jf', 2]);

        expect(base58.encode('LUv')).toStrictEqual(new Uint8Array([255, 255]));
        expect(base58.decode(new Uint8Array([255, 255]))).toStrictEqual(['LUv', 2]);

        const pubkey = 'LorisCg1FTs89a32VSrFskYDgiRbNQzct1WxyZb7nuA';
        const bytes = new Uint8Array([
            5, 19, 4, 94, 5, 47, 73, 25, 182, 8, 150, 61, 231, 60, 102, 110, 6, 114, 224, 110, 40, 20, 10, 184, 65, 191,
            241, 204, 131, 161, 120, 181,
        ]);
        expect(base58.encode(pubkey)).toStrictEqual(bytes);
        expect(base58.decode(bytes)).toStrictEqual([pubkey, 32]);

        expect(() => base58.encode('INVALID_INPUT')).toThrow('Expected a string of base 58, got [INVALID_INPUT].');
    });
});
