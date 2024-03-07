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
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

/** Defines the config for bytes codecs. */
export type BytesCodecConfig<TSize extends NumberCodec | NumberDecoder | NumberEncoder> = {
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
export function getBytesEncoder<TSize extends number>(
    config: BytesCodecConfig<NumberEncoder> & { size: TSize },
): FixedSizeEncoder<Uint8Array, TSize>;
export function getBytesEncoder(config?: BytesCodecConfig<NumberEncoder>): VariableSizeEncoder<Uint8Array>;
export function getBytesEncoder(config: BytesCodecConfig<NumberEncoder> = {}): Encoder<Uint8Array> {
    const size = config.size ?? 'variable';

    const byteEncoder: Encoder<Uint8Array> = createEncoder({
        getSizeFromValue: (value: Uint8Array) => value.length,
        write: (value: Uint8Array, bytes, offset) => {
            bytes.set(value, offset);
            return offset + value.length;
        },
    });

    if (size === 'variable') {
        return byteEncoder;
    }

    if (typeof size === 'number') {
        return fixEncoder(byteEncoder, size);
    }

    return createEncoder({
        getSizeFromValue: (value: Uint8Array) => getEncodedSize(value.length, size) + value.length,
        write: (value: Uint8Array, bytes, offset) => {
            offset = size.write(value.length, bytes, offset);
            return byteEncoder.write(value, bytes, offset);
        },
    });
}

/**
 * Decodes sized bytes.
 *
 * @param config - A set of config for the decoder.
 */
export function getBytesDecoder<TSize extends number>(
    config: BytesCodecConfig<NumberDecoder> & { size: TSize },
): FixedSizeDecoder<Uint8Array, TSize>;
export function getBytesDecoder(config?: BytesCodecConfig<NumberDecoder>): VariableSizeDecoder<Uint8Array>;
export function getBytesDecoder(config: BytesCodecConfig<NumberDecoder> = {}): Decoder<Uint8Array> {
    const size = config.size ?? 'variable';

    const byteDecoder: Decoder<Uint8Array> = createDecoder({
        read: (bytes: Uint8Array, offset) => {
            const slice = bytes.slice(offset);
            return [slice, offset + slice.length];
        },
    });

    if (size === 'variable') {
        return byteDecoder;
    }

    if (typeof size === 'number') {
        return fixDecoder(byteDecoder, size);
    }

    return createDecoder({
        read: (bytes: Uint8Array, offset) => {
            assertByteArrayIsNotEmptyForCodec('bytes', bytes, offset);
            const [lengthBigInt, lengthOffset] = size.read(bytes, offset);
            const length = Number(lengthBigInt);
            offset = lengthOffset;
            const contentBytes = bytes.slice(offset, offset + length);
            assertByteArrayHasEnoughBytesForCodec('bytes', length, contentBytes);
            const [value, contentOffset] = byteDecoder.read(contentBytes, 0);
            offset += contentOffset;
            return [value, offset];
        },
    });
}

/**
 * Creates a sized bytes codec.
 *
 * @param config - A set of config for the codec.
 */
export function getBytesCodec<TSize extends number>(
    config: BytesCodecConfig<NumberCodec> & { size: TSize },
): FixedSizeCodec<Uint8Array, Uint8Array, TSize>;
export function getBytesCodec(config?: BytesCodecConfig<NumberCodec>): VariableSizeCodec<Uint8Array>;
export function getBytesCodec(config: BytesCodecConfig<NumberCodec> = {}): Codec<Uint8Array> {
    return combineCodec(getBytesEncoder(config), getBytesDecoder(config));
}
