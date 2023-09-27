import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { assertValidBaseString } from './assertions';

/** Encodes strings in base16. */
export const getBase16Encoder = (): Encoder<string> => ({
    description: 'base16',
    encode(value: string) {
        const lowercaseValue = value.toLowerCase();
        assertValidBaseString('0123456789abcdef', lowercaseValue, value);
        const matches = lowercaseValue.match(/.{1,2}/g);
        return Uint8Array.from(matches ? matches.map((byte: string) => parseInt(byte, 16)) : []);
    },
    fixedSize: null,
    maxSize: null,
});

/** Decodes strings in base16. */
export const getBase16Decoder = (): Decoder<string> => ({
    decode(bytes, offset = 0) {
        const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, bytes.length];
    },
    description: 'base16',
    fixedSize: null,
    maxSize: null,
});

/** Encodes and decodes strings in base16. */
export const getBase16Codec = (): Codec<string> => combineCodec(getBase16Encoder(), getBase16Decoder());
