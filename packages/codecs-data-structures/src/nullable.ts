import {
    assertIsFixedSize,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    transformDecoder,
    transformEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    FixedSizeNumberCodec,
    FixedSizeNumberDecoder,
    FixedSizeNumberEncoder,
    getU8Decoder,
    getU8Encoder,
    NumberCodec,
    NumberDecoder,
    NumberEncoder,
} from '@solana/codecs-numbers';

import { getTupleDecoder, getTupleEncoder } from './tuple';
import { getUnionDecoder, getUnionEncoder } from './union';

/** Defines the config for nullable codecs. */
export type NullableCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `null` value will skip the bytes that would
     * have been used for the item. Note that this will only work if the
     * item codec is of fixed size.
     * @defaultValue `false`
     */
    fixed?: boolean;

    /**
     * The codec to use for the boolean prefix.
     * @defaultValue u8 prefix.
     */
    prefix?: TPrefix;
};

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: NullableCodecConfig<FixedSizeNumberEncoder> & { fixed: true },
): FixedSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom, 0>,
    config?: NullableCodecConfig<FixedSizeNumberEncoder>,
): FixedSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: NullableCodecConfig<NumberEncoder> & { fixed?: false },
): VariableSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: NullableCodecConfig<NumberEncoder> = {},
): Encoder<TFrom | null> {
    const prefix = config.prefix ?? getU8Encoder();
    const fixed = config.fixed ?? false;
    const encoder = getUnionEncoder(
        [
            transformEncoder(prefix, (_value: null) => 0),
            transformEncoder(getTupleEncoder([prefix, item]), (value: TFrom): [number, TFrom] => [1, value]),
        ],
        variant => Number(variant !== null),
    );

    if (!fixed) return encoder;
    assertIsFixedSize(item);
    assertIsFixedSize(prefix);
    return fixEncoderSize(encoder, prefix.fixedSize + item.fixedSize);
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: NullableCodecConfig<FixedSizeNumberDecoder> & { fixed: true },
): FixedSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo, 0>,
    config?: NullableCodecConfig<FixedSizeNumberDecoder>,
): FixedSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config?: NullableCodecConfig<NumberDecoder> & { fixed?: false },
): VariableSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config: NullableCodecConfig<NumberDecoder> = {},
): Decoder<TTo | null> {
    const prefix = config.prefix ?? getU8Decoder();
    const fixed = config.fixed ?? false;
    const decoder = getUnionDecoder(
        [
            transformDecoder(prefix, (_value: bigint | number) => null),
            transformDecoder(getTupleDecoder([prefix, item]), ([, value]): TTo => value),
        ],
        (bytes, offset) => Number(prefix.read(bytes, offset)[0] !== 0),
    );

    if (!fixed) return decoder;
    assertIsFixedSize(item);
    assertIsFixedSize(prefix);
    return fixDecoderSize(decoder, prefix.fixedSize + item.fixedSize);
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: NullableCodecConfig<FixedSizeNumberCodec> & { fixed: true },
): FixedSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo, 0>,
    config?: NullableCodecConfig<FixedSizeNumberCodec>,
): FixedSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: NullableCodecConfig<NumberCodec> & { fixed?: false },
): VariableSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: NullableCodecConfig<NumberCodec> = {},
): Codec<TFrom | null, TTo | null> {
    type ConfigCast = NullableCodecConfig<NumberCodec> & { fixed?: false };
    return combineCodec(
        getNullableEncoder<TFrom>(item, config as ConfigCast),
        getNullableDecoder<TTo>(item, config as ConfigCast),
    );
}
