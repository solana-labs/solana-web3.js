import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

import { getBase16Codec } from '../base16';
import { getBase64Codec } from '../base64';

describe('getBase64Codec', () => {
    const base64 = getBase64Codec();
    const base16 = getBase16Codec();

    it('can encode base 64 strings', () => {
        expect(base64.encode('')).toStrictEqual(new Uint8Array([]));
        expect(base64.read(new Uint8Array([]), 0)).toStrictEqual(['', 0]);

        expect(base64.encode('AA')).toStrictEqual(new Uint8Array([0]));
        expect(base64.encode('AA==')).toStrictEqual(new Uint8Array([0]));
        expect(base64.read(new Uint8Array([0]), 0)).toStrictEqual(['AA==', 1]);

        expect(base64.encode('AQ==')).toStrictEqual(new Uint8Array([1]));
        expect(base64.read(new Uint8Array([1]), 0)).toStrictEqual(['AQ==', 1]);

        expect(base64.encode('Kg')).toStrictEqual(new Uint8Array([42]));
        expect(base64.read(new Uint8Array([42]), 0)).toStrictEqual(['Kg==', 1]);

        const sentence = 'TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu';
        const bytes = new Uint8Array([
            77, 97, 110, 121, 32, 104, 97, 110, 100, 115, 32, 109, 97, 107, 101, 32, 108, 105, 103, 104, 116, 32, 119,
            111, 114, 107, 46,
        ]);
        expect(base64.encode(sentence)).toStrictEqual(bytes);
        expect(base64.read(bytes, 0)).toStrictEqual([sentence, 27]);

        expect(() => base64.encode('INVALID_INPUT')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                base: 64,
                value: 'INVALID_INPUT',
            }),
        );

        const base64TokenData =
            'AShNrkm2joOHhfQnRCzfSbrtDUkUcJSS7PJryR4PPjsnyyIWxL0ESVFoE7QWBowtz2B/iTtUGdb2EEyKbLuN5gEAAAAAAAAAAQAAAGCtpnOhgF7t+dM8By+nG51mKI9Dgb0RtO/6xvPX1w52AgAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        const base16TokenData =
            '01284dae49b68e838785f427442cdf49baed0d4914709492ecf26bc91e0f3e3b27cb2216c4bd0449516813b416068c2dcf607f893b5419d6f6104c8a6cbb8de601000000000000000100000060ada673a1805eedf9d33c072fa71b9d66288f4381bd11b4effac6f3d7d70e76020000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

        expect(base16.decode(base64.encode(base64TokenData))).toStrictEqual(base16TokenData);
        expect(base64.decode(base16.encode(base16TokenData))).toStrictEqual(base64TokenData);
    });

    if (__BROWSER__) {
        it('fails if base64 strings do not have the expected padding', () => {
            // This is because atob is not tolerant to missing padding.
            expect(() => base64.encode('A')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                    base: 64,
                    value: 'A',
                }),
            );
            expect(() => base64.encode('AA=')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                    base: 64,
                    value: 'AA=',
                }),
            );
        });
    } else {
        it('tolerate base64 string with less padding than expected', () => {
            expect(base64.encode('A')).toStrictEqual(new Uint8Array([]));
            expect(base64.encode('AA=')).toStrictEqual(new Uint8Array([0]));
        });
    }
});
