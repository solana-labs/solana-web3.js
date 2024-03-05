import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

import { getBase10Codec } from '../base10';

describe('getBase10Codec', () => {
    it('can encode base 10 strings', () => {
        const base10 = getBase10Codec();

        expect(base10.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base10.read(new Uint8Array([]), 0)).toStrictEqual(['', 0]);

        expect(base10.encode('0')).toStrictEqual(new Uint8Array([0]));
        expect(base10.read(new Uint8Array([0]), 0)).toStrictEqual(['0', 1]);

        expect(base10.encode('000')).toStrictEqual(new Uint8Array([0, 0, 0]));
        expect(base10.read(new Uint8Array([0, 0, 0]), 0)).toStrictEqual(['000', 3]);

        expect(base10.encode('1')).toStrictEqual(new Uint8Array([1]));
        expect(base10.read(new Uint8Array([1]), 0)).toStrictEqual(['1', 1]);

        expect(base10.encode('42')).toStrictEqual(new Uint8Array([42]));
        expect(base10.read(new Uint8Array([42]), 0)).toStrictEqual(['42', 1]);

        expect(base10.encode('1024')).toStrictEqual(new Uint8Array([4, 0]));
        expect(base10.read(new Uint8Array([4, 0]), 0)).toStrictEqual(['1024', 2]);

        expect(base10.encode('65535')).toStrictEqual(new Uint8Array([255, 255]));
        expect(base10.read(new Uint8Array([255, 255]), 0)).toStrictEqual(['65535', 2]);

        expect(() => base10.encode('INVALID_INPUT')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                alphabet: '0123456789',
                base: 10,
                value: 'INVALID_INPUT',
            }),
        );
    });
});
