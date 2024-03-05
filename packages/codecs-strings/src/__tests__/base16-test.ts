import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

import { getBase16Codec } from '../base16';

describe('getBase16Codec', () => {
    it('can encode base 16 strings', () => {
        const base16 = getBase16Codec();

        expect(base16.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base16.read(new Uint8Array([]), 0)).toStrictEqual(['', 0]);

        expect(base16.encode('0')).toStrictEqual(new Uint8Array([0]));
        expect(base16.encode('00')).toStrictEqual(new Uint8Array([0]));
        expect(base16.read(new Uint8Array([0]), 0)).toStrictEqual(['00', 1]);

        expect(base16.encode('1')).toStrictEqual(new Uint8Array([1]));
        expect(base16.encode('01')).toStrictEqual(new Uint8Array([1]));
        expect(base16.read(new Uint8Array([1]), 0)).toStrictEqual(['01', 1]);

        expect(base16.encode('2a')).toStrictEqual(new Uint8Array([42]));
        expect(base16.read(new Uint8Array([42]), 0)).toStrictEqual(['2a', 1]);

        expect(base16.encode('0400')).toStrictEqual(new Uint8Array([4, 0]));
        expect(base16.read(new Uint8Array([4, 0]), 0)).toStrictEqual(['0400', 2]);

        expect(base16.encode('ffff')).toStrictEqual(new Uint8Array([255, 255]));
        expect(base16.read(new Uint8Array([255, 255]), 0)).toStrictEqual(['ffff', 2]);

        expect(() => base16.encode('INVALID_INPUT')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                alphabet: '0123456789abcdef',
                base: 16,
                value: 'INVALID_INPUT',
            }),
        );
    });
});
