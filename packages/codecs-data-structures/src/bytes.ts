import {
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    prefixDecoderSize,
    prefixEncoderSize,
    ReadonlyUint8Array,
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
): FixedSizeEncoder<ReadonlyUint8Array | Uint8Array, TSize>;
export function getBytesEncoder(
    config?: BytesCodecConfig<NumberEncoder>,
): VariableSizeEncoder<ReadonlyUint8Array | Uint8Array>;
export function getBytesEncoder(
    config: BytesCodecConfig<NumberEncoder> = {},
): Encoder<ReadonlyUint8Array | Uint8Array> {
    const size = config.size ?? 'variable';
    const byteEncoder: Encoder<ReadonlyUint8Array | Uint8Array> = createEncoder({
        getSizeFromValue: value => value.length,
        write: (value, bytes, offset) => {
            bytes.set(value, offset);
            return offset + value.length;
        },
    });

    if (size === 'variable') {
        return byteEncoder;
    }

    if (typeof size === 'number') {
        return fixEncoderSize(byteEncoder, size);
    }

    return prefixEncoderSize(byteEncoder, size);
}

/**
 * Decodes sized bytes.
 *
 * @param config - A set of config for the decoder.
 */
export function getBytesDecoder<TSize extends number>(
    config: BytesCodecConfig<NumberDecoder> & { size: TSize },
): FixedSizeDecoder<ReadonlyUint8Array, TSize>;
export function getBytesDecoder(config?: BytesCodecConfig<NumberDecoder>): VariableSizeDecoder<ReadonlyUint8Array>;
export function getBytesDecoder(config: BytesCodecConfig<NumberDecoder> = {}): Decoder<ReadonlyUint8Array> {
    const size = config.size ?? 'variable';

    const byteDecoder: Decoder<ReadonlyUint8Array> = createDecoder({
        read: (bytes, offset) => {
            const slice = bytes.slice(offset);
            return [slice, offset + slice.length];
        },
    });

    if (size === 'variable') {
        return byteDecoder;
    }

    if (typeof size === 'number') {
        return fixDecoderSize(byteDecoder, size);
    }

    return prefixDecoderSize(byteDecoder, size);
}

/**
 * Creates a sized bytes codec.
 *
 * @param config - A set of config for the codec.
 */
export function getBytesCodec<TSize extends number>(
    config: BytesCodecConfig<NumberCodec> & { size: TSize },
): FixedSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array, TSize>;
export function getBytesCodec(
    config?: BytesCodecConfig<NumberCodec>,
): VariableSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array>;
export function getBytesCodec(
    config: BytesCodecConfig<NumberCodec> = {},
): Codec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array> {
    return combineCodec(getBytesEncoder(config), getBytesDecoder(config));
}
