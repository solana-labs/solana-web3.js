import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

import { getBase58Codec } from '../base58';

describe('getBase58Codec', () => {
    it('can encode base 58 strings', () => {
        const base58 = getBase58Codec();

        expect(base58.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base58.read(new Uint8Array([]), 0)).toStrictEqual(['', 0]);

        expect(base58.encode('1')).toStrictEqual(new Uint8Array([0]));
        expect(base58.read(new Uint8Array([0]), 0)).toStrictEqual(['1', 1]);

        expect(base58.encode('2')).toStrictEqual(new Uint8Array([1]));
        expect(base58.read(new Uint8Array([1]), 0)).toStrictEqual(['2', 1]);

        expect(base58.encode('11')).toStrictEqual(new Uint8Array([0, 0]));
        expect(base58.read(new Uint8Array([0, 0]), 0)).toStrictEqual(['11', 2]);

        const zeroes32 = new Uint8Array(Array(32).fill(0));
        expect(base58.encode('1'.repeat(32))).toStrictEqual(zeroes32);
        expect(base58.read(zeroes32, 0)).toStrictEqual(['1'.repeat(32), 32]);

        expect(base58.encode('j')).toStrictEqual(new Uint8Array([42]));
        expect(base58.read(new Uint8Array([42]), 0)).toStrictEqual(['j', 1]);

        expect(base58.encode('Jf')).toStrictEqual(new Uint8Array([4, 0]));
        expect(base58.read(new Uint8Array([4, 0]), 0)).toStrictEqual(['Jf', 2]);

        expect(base58.encode('LUv')).toStrictEqual(new Uint8Array([255, 255]));
        expect(base58.read(new Uint8Array([255, 255]), 0)).toStrictEqual(['LUv', 2]);

        const pubkey = 'LorisCg1FTs89a32VSrFskYDgiRbNQzct1WxyZb7nuA';
        const bytes = new Uint8Array([
            5, 19, 4, 94, 5, 47, 73, 25, 182, 8, 150, 61, 231, 60, 102, 110, 6, 114, 224, 110, 40, 20, 10, 184, 65, 191,
            241, 204, 131, 161, 120, 181,
        ]);
        expect(base58.encode(pubkey)).toStrictEqual(bytes);
        expect(base58.read(bytes, 0)).toStrictEqual([pubkey, 32]);

        expect(() => base58.encode('INVALID_INPUT')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
                base: 58,
                value: 'INVALID_INPUT',
            }),
        );
    });

    it('computes the buffer size of base 58 strings', () => {
        const base58 = getBase58Codec();

        // Empty.
        expect(base58.getSizeFromValue('')).toBe(0);

        // Simple strings.
        expect(base58.getSizeFromValue('2')).toBe(1);
        expect(base58.getSizeFromValue('Jf')).toBe(2);

        // Leading zeroes.
        expect(base58.getSizeFromValue('1')).toBe(1);
        expect(base58.getSizeFromValue('11')).toBe(2);
        expect(base58.getSizeFromValue('11111')).toBe(5);
        expect(base58.getSizeFromValue('1'.repeat(32))).toBe(32);
        expect(base58.getSizeFromValue('11111LUv')).toBe(5 + 2);

        // Boundaries.
        expect(base58.getSizeFromValue('5Q')).toBe(1);
        expect(base58.getSizeFromValue('5R')).toBe(2);
        expect(base58.getSizeFromValue('LUv')).toBe(2);
        expect(base58.getSizeFromValue('LUw')).toBe(3);
        expect(base58.getSizeFromValue('2UzHL')).toBe(3);
        expect(base58.getSizeFromValue('2UzHM')).toBe(4);
        expect(base58.getSizeFromValue('4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofL')).toBe(31);
        expect(base58.getSizeFromValue('4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM')).toBe(32);
        expect(base58.getSizeFromValue('JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG')).toBe(32);
        expect(base58.getSizeFromValue('JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFH')).toBe(33);

        // Addresses.
        expect(base58.getSizeFromValue('LorisCg1FTs89a32VSrFskYDgiRbNQzct1WxyZb7nuA')).toBe(32);
    });
});
