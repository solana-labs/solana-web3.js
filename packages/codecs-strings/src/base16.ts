import {
    combineCodec,
    createDecoder,
    createEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { assertValidBaseString } from './assertions';

/** Encodes strings in base16. */
export const getBase16Encoder = (): VariableSizeEncoder<string> =>
    createEncoder({
        getSizeFromValue: (value: string) => Math.ceil(value.length / 2),
        write(value: string, bytes, offset) {
            const lowercaseValue = value.toLowerCase();
            assertValidBaseString('0123456789abcdef', lowercaseValue, value);
            const matches = lowercaseValue.match(/.{1,2}/g);
            const hexBytes = matches ? matches.map((byte: string) => parseInt(byte, 16)) : [];
            bytes.set(hexBytes, offset);
            return hexBytes.length + offset;
        },
    });

/** Decodes strings in base16. */
export const getBase16Decoder = (): VariableSizeDecoder<string> =>
    createDecoder({
        read(bytes, offset) {
            const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            return [value, bytes.length];
        },
    });

/** Encodes and decodes strings in base16. */
export const getBase16Codec = (): VariableSizeCodec<string> => combineCodec(getBase16Encoder(), getBase16Decoder());
