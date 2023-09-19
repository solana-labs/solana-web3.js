/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { removeNullCharacters } from './null-characters';

/** Encodes UTF-8 strings using the native `TextEncoder` API. */
export const getUtf8Encoder = (): Encoder<string> => {
    let textEncoder: TextEncoder;
    return {
        description: 'utf8',
        fixedSize: null,
        maxSize: null,
        encode: (value: string) => new Uint8Array((textEncoder ||= new TextEncoder()).encode(value)),
    };
};

/** Decodes UTF-8 strings using the native `TextDecoder` API. */
export const getUtf8Decoder = (): Decoder<string> => {
    let textDecoder: TextDecoder;
    return {
        description: 'utf8',
        fixedSize: null,
        maxSize: null,
        decode(buffer, offset = 0) {
            const value = (textDecoder ||= new TextDecoder()).decode(buffer.slice(offset));
            return [removeNullCharacters(value), buffer.length];
        },
    };
};

/** Encodes and decodes UTF-8 strings using the native `TextEncoder` and `TextDecoder` API. */
export const getUtf8Codec = (): Codec<string> => combineCodec(getUtf8Encoder(), getUtf8Decoder());
