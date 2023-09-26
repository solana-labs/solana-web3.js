/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
    assertBufferHasEnoughBytesForCodec,
    assertBufferIsNotEmptyForCodec,
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
     * The size of the buffer. It can be one of the following:
     * - a {@link NumberSerializer} that prefixes the buffer with its size.
     * - a fixed number of bytes.
     * - or `'variable'` to use the rest of the buffer.
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
        fixedSize: null,
        maxSize: null,
        encode: (value: Uint8Array) => value,
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
        description,
        fixedSize: null,
        maxSize: null,
        decode: (bytes: Uint8Array, offset = 0) => {
            const slice = bytes.slice(offset);
            return [slice, offset + slice.length];
        },
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
            assertBufferIsNotEmptyForCodec('bytes', bytes.slice(offset));
            const [lengthBigInt, lengthOffset] = size.decode(bytes, offset);
            const length = Number(lengthBigInt);
            offset = lengthOffset;
            const contentBuffer = bytes.slice(offset, offset + length);
            assertBufferHasEnoughBytesForCodec('bytes', contentBuffer, length);
            const [value, contentOffset] = byteDecoder.decode(contentBuffer);
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
