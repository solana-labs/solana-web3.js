import {
    assertIsFixedSize,
    Codec,
    combineCodec,
    containsBytes,
    Decoder,
    Encoder,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    ReadonlyUint8Array,
    transformDecoder,
    transformEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    getBooleanDecoder,
    getBooleanEncoder,
    getConstantDecoder,
    getConstantEncoder,
    getTupleDecoder,
    getTupleEncoder,
    getUnionDecoder,
    getUnionEncoder,
    getUnitDecoder,
    getUnitEncoder,
} from '@solana/codecs-data-structures';
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

/** Defines the config for Option codecs. */
export type OptionCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Defines how the `None` value should be represented.
     *
     * By default, no none value is used. This means a `None` value will be
     * represented by the absence of the item.
     *
     * When `'zeroes'` is provided, a `None` value will skip the bytes that would
     * have been used for the item. Note that this returns a fixed-size codec
     * and thus will only work if the item codec is of fixed size.
     *
     * When a custom byte array is provided, a `None` value will be represented
     * by the provided byte array. Note that this returns a variable-size codec
     * since the byte array representing `None` does not need to match the size
     * of the item codec.
     *
     * @defaultValue No none value is used.
     */
    noneValue?: ReadonlyUint8Array | 'zeroes';

    /**
     * The codec to use for the boolean prefix, if any.
     *
     * By default a `u8` number is used as a prefix to determine if the value is `None`.
     * The value `0` is encoded for `None` and `1` if the value is present.
     * This can be set to any number codec to customize the prefix.
     *
     * When `null` is provided, no prefix is used and the `noneValue` is used to
     * determine if the value is `None`. If no `noneValue` is provided, then the
     * absence of any bytes is used to determine if the value is `None`.
     *
     * @defaultValue `u8` prefix.
     */
    prefix?: TPrefix | null;
};

/**
 * Creates a encoder for an optional value using the `Option<T>` type.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getOptionEncoder<TFrom, TSize extends number>(
    item: FixedSizeEncoder<TFrom, TSize>,
    config: OptionCodecConfig<NumberEncoder> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeEncoder<OptionOrNullable<TFrom>, TSize>;
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: OptionCodecConfig<FixedSizeNumberEncoder> & { noneValue: 'zeroes' },
): FixedSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: OptionCodecConfig<NumberEncoder> & { noneValue: 'zeroes' },
): VariableSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: OptionCodecConfig<NumberEncoder> & { noneValue?: ReadonlyUint8Array },
): VariableSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: OptionCodecConfig<NumberEncoder> = {},
): Encoder<OptionOrNullable<TFrom>> {
    const prefix = (() => {
        if (config.prefix === null) {
            return transformEncoder(getUnitEncoder(), (_boolean: boolean) => undefined);
        }
        return getBooleanEncoder({ size: config.prefix ?? getU8Encoder() });
    })();
    const noneValue = (() => {
        if (config.noneValue === 'zeroes') {
            assertIsFixedSize(item);
            return fixEncoderSize(getUnitEncoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitEncoder();
        }
        return getConstantEncoder(config.noneValue);
    })();

    return getUnionEncoder(
        [
            transformEncoder(getTupleEncoder([prefix, noneValue]), (_value: None | null): [boolean, void] => [
                false,
                undefined,
            ]),
            transformEncoder(getTupleEncoder([prefix, item]), (value: Some<TFrom> | TFrom): [boolean, TFrom] => [
                true,
                isOption(value) && isSome(value) ? value.value : value,
            ]),
        ],
        variant => {
            const option = isOption<TFrom>(variant) ? variant : wrapNullable(variant);
            return Number(isSome(option));
        },
    );
}

/**
 * Creates a decoder for an optional value using the `Option<T>` type.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getOptionDecoder<TTo, TSize extends number>(
    item: FixedSizeDecoder<TTo, TSize>,
    config: OptionCodecConfig<NumberDecoder> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeDecoder<Option<TTo>, TSize>;
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: OptionCodecConfig<FixedSizeNumberDecoder> & { noneValue: 'zeroes' },
): FixedSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: OptionCodecConfig<NumberDecoder> & { noneValue: 'zeroes' },
): VariableSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config?: OptionCodecConfig<NumberDecoder> & { noneValue?: ReadonlyUint8Array },
): VariableSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config: OptionCodecConfig<NumberDecoder> = {},
): Decoder<Option<TTo>> {
    const prefix = (() => {
        if (config.prefix === null) {
            return transformDecoder(getUnitDecoder(), () => false);
        }
        return getBooleanDecoder({ size: config.prefix ?? getU8Decoder() });
    })();
    const noneValue = (() => {
        if (config.noneValue === 'zeroes') {
            assertIsFixedSize(item);
            return fixDecoderSize(getUnitDecoder(), item.fixedSize);
        }
        if (!config.noneValue) {
            return getUnitDecoder();
        }
        return getConstantDecoder(config.noneValue);
    })();

    return getUnionDecoder(
        [
            transformDecoder(getTupleDecoder([prefix, noneValue]), () => none<TTo>()),
            transformDecoder(getTupleDecoder([prefix, item]), ([, value]) => some(value)),
        ],
        (bytes, offset) => {
            if (config.prefix === null && !config.noneValue) {
                return Number(offset < bytes.length);
            }
            if (config.prefix === null && config.noneValue != null) {
                const zeroValue =
                    config.noneValue === 'zeroes' ? new Uint8Array(noneValue.fixedSize).fill(0) : config.noneValue;
                return containsBytes(bytes, zeroValue, offset) ? 0 : 1;
            }
            return Number(prefix.read(bytes, offset)[0]);
        },
    );
}

/**
 * Creates a codec for an optional value using the `Option<T>` type.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getOptionCodec<TFrom, TTo extends TFrom, TSize extends number>(
    item: FixedSizeCodec<TFrom, TTo, TSize>,
    config: OptionCodecConfig<NumberCodec> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>, TSize>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: OptionCodecConfig<FixedSizeNumberCodec> & { noneValue: 'zeroes' },
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: OptionCodecConfig<NumberCodec> & { noneValue: 'zeroes' },
): VariableSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: OptionCodecConfig<NumberCodec> & { noneValue?: ReadonlyUint8Array },
): VariableSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: OptionCodecConfig<NumberCodec> = {},
): Codec<OptionOrNullable<TFrom>, Option<TTo>> {
    type ConfigCast = OptionCodecConfig<NumberCodec> & { noneValue?: ReadonlyUint8Array };
    return combineCodec(
        getOptionEncoder<TFrom>(item, config as ConfigCast),
        getOptionDecoder<TTo>(item, config as ConfigCast),
    );
}
