import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    BaseCodecConfig,
    Codec,
    CodecData,
    combineCodec,
    Decoder,
    Encoder,
    fixDecoder,
    fixEncoder,
    mergeBytes,
} from '@solana/codecs-core';
import { getU32Decoder, getU32Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { getUtf8Decoder, getUtf8Encoder } from './utf8';

/** Defines the config for string codecs. */
export type StringCodecConfig<
    TPrefix extends NumberCodec | NumberEncoder | NumberDecoder,
    TEncoding extends Codec<string> | Encoder<string> | Decoder<string>
> = BaseCodecConfig & {
    /**
     * The size of the string. It can be one of the following:
     * - a {@link NumberCodec} that prefixes the string with its size.
     * - a fixed number of bytes.
     * - or `'variable'` to use the rest of the byte array.
     * @defaultValue u32 prefix.
     */
    size?: TPrefix | number | 'variable';

    /**
     * The codec to use for encoding and decoding the content.
     * @defaultValue UTF-8 encoding.
     */
    encoding?: TEncoding;
};

/** Encodes strings from a given encoding and size strategy. */
export const getStringEncoder = (config: StringCodecConfig<NumberEncoder, Encoder<string>> = {}): Encoder<string> => {
    const size = config.size ?? getU32Encoder();
    const encoding = config.encoding ?? getUtf8Encoder();
    const description = config.description ?? `string(${encoding.description}; ${getSizeDescription(size)})`;

    if (size === 'variable') {
        return { ...encoding, description };
    }

    if (typeof size === 'number') {
        return fixEncoder(encoding, size, description);
    }

    return {
        description,
        encode: (value: string) => {
            const contentBytes = encoding.encode(value);
            const lengthBytes = size.encode(contentBytes.length);
            return mergeBytes([lengthBytes, contentBytes]);
        },
        fixedSize: null,
        maxSize: null,
    };
};

/** Decodes strings from a given encoding and size strategy. */
export const getStringDecoder = (config: StringCodecConfig<NumberDecoder, Decoder<string>> = {}): Decoder<string> => {
    const size = config.size ?? getU32Decoder();
    const encoding = config.encoding ?? getUtf8Decoder();
    const description = config.description ?? `string(${encoding.description}; ${getSizeDescription(size)})`;

    if (size === 'variable') {
        return { ...encoding, description };
    }

    if (typeof size === 'number') {
        return fixDecoder(encoding, size, description);
    }

    return {
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('string', bytes, offset);
            const [lengthBigInt, lengthOffset] = size.decode(bytes, offset);
            const length = Number(lengthBigInt);
            offset = lengthOffset;
            const contentBytes = bytes.slice(offset, offset + length);
            assertByteArrayHasEnoughBytesForCodec('string', length, contentBytes);
            const [value, contentOffset] = encoding.decode(contentBytes);
            offset += contentOffset;
            return [value, offset];
        },
        description,
        fixedSize: null,
        maxSize: null,
    };
};

/** Encodes and decodes strings from a given encoding and size strategy. */
export const getStringCodec = (config: StringCodecConfig<NumberCodec, Codec<string>> = {}): Codec<string> =>
    combineCodec(getStringEncoder(config), getStringDecoder(config));

function getSizeDescription(size: CodecData | number | 'variable'): string {
    return typeof size === 'object' ? size.description : `${size}`;
}
