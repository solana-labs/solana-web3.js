import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    BaseCodecOptions,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    fixDecoder,
    fixEncoder,
    mergeBytes,
} from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

/** Defines the options for bytes codecs. */
export type BytesCodecOptions<TSize extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
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
 * @param options - A set of options for the encoder.
 */
export function getBytesEncoder(options: BytesCodecOptions<NumberEncoder> = {}): Encoder<Uint8Array> {
    const size = options.size ?? 'variable';
    const sizeDescription = typeof size === 'object' ? size.description : `${size}`;
    const description = options.description ?? `bytes(${sizeDescription})`;

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
 * @param options - A set of options for the decoder.
 */
export function getBytesDecoder(options: BytesCodecOptions<NumberDecoder> = {}): Decoder<Uint8Array> {
    const size = options.size ?? 'variable';
    const sizeDescription = typeof size === 'object' ? size.description : `${size}`;
    const description = options.description ?? `bytes(${sizeDescription})`;

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
 * @param options - A set of options for the codec.
 */
export function getBytesCodec(options: BytesCodecOptions<NumberCodec> = {}): Codec<Uint8Array> {
    return combineCodec(getBytesEncoder(options), getBytesDecoder(options));
}
