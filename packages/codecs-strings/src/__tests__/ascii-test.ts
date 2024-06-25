import { SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, SolanaError } from '@solana/errors';

import { ascii, AsciiString, getAsciiCodec } from '../ascii';

describe('ascii', () => {
    it('validates valid ASCI strings', () => {
        expect(ascii('my valid ASCII string')).toBe('my valid ASCII string');
    });

    it('validates empty strings', () => {
        expect(ascii('')).toBe('');
    });

    it('fails to validate invalid ASCI strings', () => {
        // @ts-expect-error Invalid ASCII character.
        expect(() => ascii('my invalid ASCII 語 string')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, {
                value: 'my invalid ASCII 語 string',
            }),
        );
    });
});

describe('getAsciiCodec', () => {
    it('encodes ASCII strings', () => {
        const bytes = getAsciiCodec().encode(ascii('ABC'));
        expect(bytes).toStrictEqual(new Uint8Array([65, 66, 67]));
    });

    it('decodes ASCII strings', () => {
        const value = getAsciiCodec().decode(new Uint8Array([65, 66, 67]));
        value satisfies AsciiString;
        expect(value).toBe('ABC');
    });

    it('cannot encode non-ASCII strings', () => {
        // @ts-expect-error Invalid ASCII character.
        expect(() => getAsciiCodec().encode('ABC語')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, {
                value: 'ABC語',
            }),
        );
    });

    it('cannot decode non-ASCII strings', () => {
        const bytes = new Uint8Array([65, 66, 67, 232, 170, 158]); // ABC語
        expect(() => getAsciiCodec().decode(bytes)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, {
                value: 'ABC語',
            }),
        );
    });
});
