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
import { getTupleDecoder, getTupleEncoder, getUnionDecoder, getUnionEncoder } from '@solana/codecs-data-structures';
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

import { isOption, isSome, None, none, Option, OptionOrNullable, Some, some } from './option';
import { wrapNullable } from './unwrap-option';

/** Defines the config for option codecs. */
export type OptionCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `None` value will skip the bytes that would
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
 * Creates a encoder for an optional value using the `Option<T>` type.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: OptionCodecConfig<FixedSizeNumberEncoder> & { fixed: true },
): FixedSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom, 0>,
    config?: OptionCodecConfig<FixedSizeNumberEncoder>,
): FixedSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: OptionCodecConfig<NumberEncoder> & { fixed?: false },
): VariableSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: OptionCodecConfig<NumberEncoder> = {},
): Encoder<OptionOrNullable<TFrom>> {
    const prefix = config.prefix ?? getU8Encoder();
    const fixed = config.fixed ?? false;
    const encoder = getUnionEncoder(
        [
            transformEncoder(prefix, (_value: None | null) => 0),
            transformEncoder(getTupleEncoder([prefix, item]), (value: Some<TFrom> | TFrom): [number, TFrom] => {
                return [1, isOption(value) && isSome(value) ? value.value : value];
            }),
        ],
        (variant: OptionOrNullable<TFrom>) => {
            const option = isOption<TFrom>(variant) ? variant : wrapNullable(variant);
            return Number(isSome(option));
        },
    );

    if (!fixed) return encoder;
    assertIsFixedSize(item);
    assertIsFixedSize(prefix);
    return fixEncoderSize(encoder, prefix.fixedSize + item.fixedSize);
}

/**
 * Creates a decoder for an optional value using the `Option<T>` type.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: OptionCodecConfig<FixedSizeNumberDecoder> & { fixed: true },
): FixedSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo, 0>,
    config?: OptionCodecConfig<FixedSizeNumberDecoder>,
): FixedSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config?: OptionCodecConfig<NumberDecoder> & { fixed?: false },
): VariableSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config: OptionCodecConfig<NumberDecoder> = {},
): Decoder<Option<TTo>> {
    const prefix = config.prefix ?? getU8Decoder();
    const fixed = config.fixed ?? false;
    const decoder = getUnionDecoder(
        [
            transformDecoder(prefix, (_value: bigint | number) => none<TTo>()),
            transformDecoder(getTupleDecoder([prefix, item]), ([, value]) => some(value)),
        ],
        (bytes, offset) => Number(prefix.read(bytes, offset)[0] !== 0),
    );

    if (!fixed) return decoder;
    assertIsFixedSize(item);
    assertIsFixedSize(prefix);
    return fixDecoderSize(decoder, prefix.fixedSize + item.fixedSize);
}

/**
 * Creates a codec for an optional value using the `Option<T>` type.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: OptionCodecConfig<FixedSizeNumberCodec> & { fixed: true },
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo, 0>,
    config?: OptionCodecConfig<FixedSizeNumberCodec>,
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: OptionCodecConfig<NumberCodec> & { fixed?: false },
): VariableSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: OptionCodecConfig<NumberCodec> = {},
): Codec<OptionOrNullable<TFrom>, Option<TTo>> {
    type ConfigCast = OptionCodecConfig<NumberCodec> & { fixed?: false };
    return combineCodec(
        getOptionEncoder<TFrom>(item, config as ConfigCast),
        getOptionDecoder<TTo>(item, config as ConfigCast),
    );
}
