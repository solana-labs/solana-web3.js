import {
    combineCodec,
    createDecoder,
    createEncoder,
    transformDecoder,
    transformEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, SolanaError } from '@solana/errors';

import { assertValidBaseString } from './assertions';
import { getBaseXResliceDecoder, getBaseXResliceEncoder } from './baseX-reslice';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Encodes strings in base64. */
export const getBase64Encoder = (): VariableSizeEncoder<string> => {
    if (__BROWSER__) {
        return createEncoder({
            getSizeFromValue: (value: string) => {
                try {
                    return (atob as Window['atob'])(value).length;
                } catch (e) {
                    throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                        alphabet,
                        base: 64,
                        value,
                    });
                }
            },
            write(value: string, bytes, offset) {
                try {
                    const bytesToAdd = (atob as Window['atob'])(value)
                        .split('')
                        .map(c => c.charCodeAt(0));
                    bytes.set(bytesToAdd, offset);
                    return bytesToAdd.length + offset;
                } catch (e) {
                    throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                        alphabet,
                        base: 64,
                        value,
                    });
                }
            },
        });
    }

    if (__NODEJS__) {
        return createEncoder({
            getSizeFromValue: (value: string) => Buffer.from(value, 'base64').length,
            write(value: string, bytes, offset) {
                assertValidBaseString(alphabet, value.replace(/=/g, ''));
                const buffer = Buffer.from(value, 'base64');
                bytes.set(buffer, offset);
                return buffer.length + offset;
            },
        });
    }

    return transformEncoder(getBaseXResliceEncoder(alphabet, 6), (value: string): string => value.replace(/=/g, ''));
};

/** Decodes strings in base64. */
export const getBase64Decoder = (): VariableSizeDecoder<string> => {
    if (__BROWSER__) {
        return createDecoder({
            read(bytes, offset = 0) {
                const slice = bytes.slice(offset);
                const value = (btoa as Window['btoa'])(String.fromCharCode(...slice));
                return [value, bytes.length];
            },
        });
    }

    if (__NODEJS__) {
        return createDecoder({
            read: (bytes, offset = 0) => [Buffer.from(bytes, offset).toString('base64'), bytes.length],
        });
    }

    return transformDecoder(getBaseXResliceDecoder(alphabet, 6), (value: string): string =>
        value.padEnd(Math.ceil(value.length / 4) * 4, '='),
    );
};

/** Encodes and decodes strings in base64. */
export const getBase64Codec = (): VariableSizeCodec<string> => combineCodec(getBase64Encoder(), getBase64Decoder());
