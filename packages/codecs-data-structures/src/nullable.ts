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
    FixedSizeNumberCodec,
    FixedSizeNumberDecoder,
    FixedSizeNumberEncoder,
    getU8Decoder,
    getU8Encoder,
    NumberCodec,
    NumberDecoder,
    NumberEncoder,
} from '@solana/codecs-numbers';

import { getBooleanDecoder, getBooleanEncoder } from './boolean';
import { getConstantDecoder, getConstantEncoder } from './constant';
import { getTupleDecoder, getTupleEncoder } from './tuple';
import { getUnionDecoder, getUnionEncoder } from './union';
import { getUnitDecoder, getUnitEncoder } from './unit';

/** Defines the config for nullable codecs. */
export type NullableCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Defines how the `None` (or `null`) value should be represented.
     *
     * By default, no none value is used. This means a `null` value will be
     * represented by the absence of the item.
     *
     * When `'zeroes'` is provided, a `null` value will skip the bytes that would
     * have been used for the item. Note that this returns a fixed-size codec
     * and thus will only work if the item codec is of fixed size.
     *
     * When a custom byte array is provided, a `null` value will be represented
     * by the provided byte array. Note that this returns a variable-size codec
     * since the byte array representing `null` does not need to match the size
     * of the item codec.
     *
     * @defaultValue No none value is used.
     */
    noneValue?: ReadonlyUint8Array | 'zeroes';

    /**
     * The codec to use for the boolean prefix, if any.
     *
     * By default a `u8` number is used as a prefix to determine if the value is `null`.
     * The value `0` is encoded for `null` and `1` if the value is present.
     * This can be set to any number codec to customize the prefix.
     *
     * When `null` is provided, no prefix is used and the `noneValue` is used to
     * determine if the value is `null`. If no `noneValue` is provided, then the
     * absence of any bytes is used to determine if the value is `null`.
     *
     * @defaultValue `u8` prefix.
     */
    prefix?: TPrefix | null;
};

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getNullableEncoder<TFrom, TSize extends number>(
    item: FixedSizeEncoder<TFrom, TSize>,
    config: NullableCodecConfig<NumberEncoder> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeEncoder<TFrom | null, TSize>;
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: NullableCodecConfig<FixedSizeNumberEncoder> & { noneValue: 'zeroes' },
): FixedSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: NullableCodecConfig<NumberEncoder> & { noneValue: 'zeroes' },
): VariableSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: NullableCodecConfig<NumberEncoder> & { noneValue?: ReadonlyUint8Array },
): VariableSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: NullableCodecConfig<NumberEncoder> = {},
): Encoder<TFrom | null> {
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
            transformEncoder(getTupleEncoder([prefix, noneValue]), (_value: null): [boolean, void] => [
                false,
                undefined,
            ]),
            transformEncoder(getTupleEncoder([prefix, item]), (value: TFrom): [boolean, TFrom] => [true, value]),
        ],
        variant => Number(variant !== null),
    );
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getNullableDecoder<TTo, TSize extends number>(
    item: FixedSizeDecoder<TTo, TSize>,
    config: NullableCodecConfig<NumberDecoder> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeDecoder<TTo | null, TSize>;
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: NullableCodecConfig<FixedSizeNumberDecoder> & { noneValue: 'zeroes' },
): FixedSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: NullableCodecConfig<NumberDecoder> & { noneValue: 'zeroes' },
): VariableSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config?: NullableCodecConfig<NumberDecoder> & { noneValue?: ReadonlyUint8Array },
): VariableSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config: NullableCodecConfig<NumberDecoder> = {},
): Decoder<TTo | null> {
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
            transformDecoder(getTupleDecoder([prefix, noneValue]), () => null),
            transformDecoder(getTupleDecoder([prefix, item]), ([, value]): TTo => value),
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
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getNullableCodec<TFrom, TTo extends TFrom, TSize extends number>(
    item: FixedSizeCodec<TFrom, TTo, TSize>,
    config: NullableCodecConfig<NumberCodec> & { noneValue: 'zeroes'; prefix: null },
): FixedSizeCodec<TFrom | null, TTo | null, TSize>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: NullableCodecConfig<FixedSizeNumberCodec> & { noneValue: 'zeroes' },
): FixedSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: NullableCodecConfig<NumberCodec> & { noneValue: 'zeroes' },
): VariableSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: NullableCodecConfig<NumberCodec> & { noneValue?: ReadonlyUint8Array },
): VariableSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: NullableCodecConfig<NumberCodec> = {},
): Codec<TFrom | null, TTo | null> {
    type ConfigCast = NullableCodecConfig<NumberCodec> & { noneValue?: ReadonlyUint8Array };
    return combineCodec(
        getNullableEncoder<TFrom>(item, config as ConfigCast),
        getNullableDecoder<TTo>(item, config as ConfigCast),
    );
}
