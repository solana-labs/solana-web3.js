import { combineCodec, Decoder, Encoder, mapDecoder, mapEncoder } from '@solana/codecs-core';

import { assertValidBaseString } from './assertions';
import { getBaseXResliceDecoder, getBaseXResliceEncoder } from './baseX-reslice';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Encodes strings in base64. */
export const getBase64Encoder = (): Encoder<string> => {
    if (__BROWSER__) {
        return {
            description: `base64`,
            encode(value: string): Uint8Array {
                try {
                    const bytes = (atob as Window['atob'])(value)
                        .split('')
                        .map(c => c.charCodeAt(0));
                    return new Uint8Array(bytes);
                } catch (e) {
                    // TODO: Coded error.
                    throw new Error(`Expected a string of base 64, got [${value}].`);
                }
            },
            fixedSize: null,
            maxSize: null,
        };
    }

    if (__NODEJS__) {
        return {
            description: `base64`,
            encode(value: string): Uint8Array {
                assertValidBaseString(alphabet, value.replace(/=/g, ''));
                return new Uint8Array(Buffer.from(value, 'base64'));
            },
            fixedSize: null,
            maxSize: null,
        };
    }

    return mapEncoder(getBaseXResliceEncoder(alphabet, 6), (value: string): string => value.replace(/=/g, ''));
};

/** Decodes strings in base64. */
export const getBase64Decoder = (): Decoder<string> => {
    if (__BROWSER__) {
        return {
            decode(bytes, offset = 0) {
                const slice = bytes.slice(offset);
                const value = (btoa as Window['btoa'])(String.fromCharCode(...slice));
                return [value, bytes.length];
            },
            description: `base64`,
            fixedSize: null,
            maxSize: null,
        };
    }

    if (__NODEJS__) {
        return {
            decode: (bytes, offset = 0) => [Buffer.from(bytes, offset).toString('base64'), bytes.length],
            description: `base64`,
            fixedSize: null,
            maxSize: null,
        };
    }

    return mapDecoder(getBaseXResliceDecoder(alphabet, 6), (value: string): string =>
        value.padEnd(Math.ceil(value.length / 4) * 4, '=')
    );
};

/** Encodes and decodes strings in base64. */
export const getBase64Codec = () => combineCodec(getBase64Encoder(), getBase64Decoder());
