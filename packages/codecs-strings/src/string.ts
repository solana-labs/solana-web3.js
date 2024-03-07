import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    fixDecoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoder,
    getEncodedSize,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Decoder, getU32Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { getUtf8Decoder, getUtf8Encoder } from './utf8';

/** Defines the config for string codecs. */
export type StringCodecConfig<
    TPrefix extends NumberCodec | NumberDecoder | NumberEncoder,
    TEncoding extends Codec<string> | Decoder<string> | Encoder<string>,
> = {
    /**
     * The codec to use for encoding and decoding the content.
     * @defaultValue UTF-8 encoding.
     */
    encoding?: TEncoding;

    /**
     * The size of the string. It can be one of the following:
     * - a {@link NumberCodec} that prefixes the string with its size.
     * - a fixed number of bytes.
     * - or `'variable'` to use the rest of the byte array.
     * @defaultValue u32 prefix.
     */
    size?: TPrefix | number | 'variable';
};

/** Encodes strings from a given encoding and size strategy. */
export function getStringEncoder<TSize extends number>(
    config: StringCodecConfig<NumberEncoder, Encoder<string>> & { size: TSize },
): FixedSizeEncoder<string, TSize>;
export function getStringEncoder<TSize extends number>(
    config: StringCodecConfig<NumberEncoder, Encoder<string>> & {
        encoding: FixedSizeEncoder<string, TSize>;
        size: 'variable';
    },
): FixedSizeEncoder<string, TSize>;
export function getStringEncoder(
    config?: StringCodecConfig<NumberEncoder, Encoder<string>>,
): VariableSizeEncoder<string>;
export function getStringEncoder(config: StringCodecConfig<NumberEncoder, Encoder<string>> = {}): Encoder<string> {
    const size = config.size ?? getU32Encoder();
    const encoding = config.encoding ?? getUtf8Encoder();

    if (size === 'variable') {
        return encoding;
    }

    if (typeof size === 'number') {
        return fixEncoder(encoding, size);
    }

    return createEncoder({
        getSizeFromValue: (value: string) => {
            const contentSize = getEncodedSize(value, encoding);
            return getEncodedSize(contentSize, size) + contentSize;
        },
        write: (value: string, bytes, offset) => {
            const contentSize = getEncodedSize(value, encoding);
            offset = size.write(contentSize, bytes, offset);
            return encoding.write(value, bytes, offset);
        },
    });
}

/** Decodes strings from a given encoding and size strategy. */
export function getStringDecoder<TSize extends number>(
    config: StringCodecConfig<NumberDecoder, Decoder<string>> & { size: TSize },
): FixedSizeDecoder<string, TSize>;
export function getStringDecoder<TSize extends number>(
    config: StringCodecConfig<NumberDecoder, Decoder<string>> & {
        encoding: FixedSizeDecoder<string, TSize>;
        size: 'variable';
    },
): FixedSizeDecoder<string, TSize>;
export function getStringDecoder(
    config?: StringCodecConfig<NumberDecoder, Decoder<string>>,
): VariableSizeDecoder<string>;
export function getStringDecoder(config: StringCodecConfig<NumberDecoder, Decoder<string>> = {}): Decoder<string> {
    const size = config.size ?? getU32Decoder();
    const encoding = config.encoding ?? getUtf8Decoder();

    if (size === 'variable') {
        return encoding;
    }

    if (typeof size === 'number') {
        return fixDecoder(encoding, size);
    }

    return createDecoder({
        read: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('string', bytes, offset);
            const [lengthBigInt, lengthOffset] = size.read(bytes, offset);
            const length = Number(lengthBigInt);
            offset = lengthOffset;
            const contentBytes = bytes.slice(offset, offset + length);
            assertByteArrayHasEnoughBytesForCodec('string', length, contentBytes);
            const [value, contentOffset] = encoding.read(contentBytes, 0);
            offset += contentOffset;
            return [value, offset];
        },
    });
}

/** Encodes and decodes strings from a given encoding and size strategy. */
export function getStringCodec<TSize extends number>(
    config: StringCodecConfig<NumberCodec, Codec<string>> & { size: TSize },
): FixedSizeCodec<string, string, TSize>;
export function getStringCodec<TSize extends number>(
    config: StringCodecConfig<NumberCodec, Codec<string>> & {
        encoding: FixedSizeCodec<string, string, TSize>;
        size: 'variable';
    },
): FixedSizeCodec<string, string, TSize>;
export function getStringCodec(config?: StringCodecConfig<NumberCodec, Codec<string>>): VariableSizeCodec<string>;
export function getStringCodec(config: StringCodecConfig<NumberCodec, Codec<string>> = {}): Codec<string> {
    return combineCodec(getStringEncoder(config), getStringDecoder(config));
}
