import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    BaseCodecConfig,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    fixDecoder,
    fixEncoder,
    mergeBytes,
} from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

/** Defines the config for bytes codecs. */
export type BytesCodecConfig<TSize extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecConfig & {
    /**
     * The size of the byte array. It can be one of the following:
     * - a {@link NumberSerializer} that prefixes the byte array with its size.
     * - a fixed number of bytes.
     * - or `'variable'` to use the rest of the byte array.
     * @defaultValue `'variable'`
     */
    size?: TSize | number | 'variable';
};

/**
 * Encodes sized bytes.
 *
 * @param config - A set of config for the encoder.
 */
export function getBytesEncoder(config: BytesCodecConfig<NumberEncoder> = {}): Encoder<Uint8Array> {
    const size = config.size ?? 'variable';
    const sizeDescription = typeof size === 'object' ? size.description : `${size}`;
    const description = config.description ?? `bytes(${sizeDescription})`;

    const byteEncoder: Encoder<Uint8Array> = {
        description,
        encode: (value: Uint8Array) => value,
        fixedSize: null,
        maxSize: null,
    };

    if (size === 'variable') {
        return byteEncoder;
    }

    if (typeof size === 'number') {
        return fixEncoder(byteEncoder, size, description);
    }

    return {
        ...byteEncoder,
        encode: (value: Uint8Array) => {
            const contentBytes = byteEncoder.encode(value);
            const lengthBytes = size.encode(contentBytes.length);
            return mergeBytes([lengthBytes, contentBytes]);
        },
    };
}

/**
 * Decodes sized bytes.
 *
 * @param config - A set of config for the decoder.
 */
export function getBytesDecoder(config: BytesCodecConfig<NumberDecoder> = {}): Decoder<Uint8Array> {
    const size = config.size ?? 'variable';
    const sizeDescription = typeof size === 'object' ? size.description : `${size}`;
    const description = config.description ?? `bytes(${sizeDescription})`;

    const byteDecoder: Decoder<Uint8Array> = {
        decode: (bytes: Uint8Array, offset = 0) => {
            const slice = bytes.slice(offset);
            return [slice, offset + slice.length];
        },
        description,
        fixedSize: null,
        maxSize: null,
    };

    if (size === 'variable') {
        return byteDecoder;
    }

    if (typeof size === 'number') {
        return fixDecoder(byteDecoder, size, description);
    }

    return {
        ...byteDecoder,
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('bytes', bytes, offset);
            const [lengthBigInt, lengthOffset] = size.decode(bytes, offset);
            const length = Number(lengthBigInt);
            offset = lengthOffset;
            const contentBytes = bytes.slice(offset, offset + length);
            assertByteArrayHasEnoughBytesForCodec('bytes', length, contentBytes);
            const [value, contentOffset] = byteDecoder.decode(contentBytes);
            offset += contentOffset;
            return [value, offset];
        },
    };
}

/**
 * Creates a sized bytes codec.
 *
 * @param config - A set of config for the codec.
 */
export function getBytesCodec(config: BytesCodecConfig<NumberCodec> = {}): Codec<Uint8Array> {
    return combineCodec(getBytesEncoder(config), getBytesDecoder(config));
}
