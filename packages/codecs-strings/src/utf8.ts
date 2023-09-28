import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';
import { TextDecoder, TextEncoder } from 'text-encoding-impl';

import { removeNullCharacters } from './null-characters';

/** Encodes UTF-8 strings using the native `TextEncoder` API. */
export const getUtf8Encoder = (): Encoder<string> => {
    let textEncoder: TextEncoder;
    return {
        description: 'utf8',
        encode: (value: string) => new Uint8Array((textEncoder ||= new TextEncoder()).encode(value)),
        fixedSize: null,
        maxSize: null,
    };
};

/** Decodes UTF-8 strings using the native `TextDecoder` API. */
export const getUtf8Decoder = (): Decoder<string> => {
    let textDecoder: TextDecoder;
    return {
        decode(bytes, offset = 0) {
            const value = (textDecoder ||= new TextDecoder()).decode(bytes.slice(offset));
            return [removeNullCharacters(value), bytes.length];
        },
        description: 'utf8',
        fixedSize: null,
        maxSize: null,
    };
};

/** Encodes and decodes UTF-8 strings using the native `TextEncoder` and `TextDecoder` API. */
export const getUtf8Codec = (): Codec<string> => combineCodec(getUtf8Encoder(), getUtf8Decoder());
