import {
    combineCodec,
    containsBytes,
    fixDecoderSize,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    fixEncoderSize,
    ReadonlyUint8Array,
    transformDecoder,
    transformEncoder,
} from '@solana/codecs-core';
import { getBase16Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, SolanaError } from '@solana/errors';

import { getBytesDecoder, getBytesEncoder } from './bytes';
import { getUnionDecoder, getUnionEncoder } from './union';

/** Defines the config for zeroable nullable codecs. */
export type ZeroableNullableCodecConfig = {
    /**
     * Defines what the zero value is for the codec.
     * When decoding this exact value, it will be treated as `null`.
     *
     * Note that the provided byte array must be the same length as the
     * codec's fixed size.
     * @defaultValue A `Uint8Array` full of zeros.
     */
    zeroValue?: ReadonlyUint8Array;
};

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `null`.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getZeroableNullableEncoder<TFrom, TSize extends number>(
    item: FixedSizeEncoder<TFrom, TSize>,
    config: ZeroableNullableCodecConfig = {},
): FixedSizeEncoder<TFrom | null, TSize> {
    const zeroValue = getZeroValue(item.fixedSize, config.zeroValue);
    return getUnionEncoder(
        [transformEncoder(fixEncoderSize(getBytesEncoder(), item.fixedSize), (_value: null) => zeroValue), item],
        variant => Number(variant !== null),
    ) as FixedSizeEncoder<TFrom | null, TSize>;
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `null`.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getZeroableNullableDecoder<TTo, TSize extends number>(
    item: FixedSizeDecoder<TTo, TSize>,
    config: ZeroableNullableCodecConfig = {},
): FixedSizeDecoder<TTo | null, TSize> {
    const zeroValue = getZeroValue(item.fixedSize, config.zeroValue);
    return getUnionDecoder(
        [transformDecoder(fixDecoderSize(getBytesDecoder(), item.fixedSize), () => null), item],
        (bytes, offset) => (containsBytes(bytes, zeroValue, offset) ? 0 : 1),
    ) as FixedSizeDecoder<TTo | null, TSize>;
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `null`.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getZeroableNullableCodec<TFrom, TTo extends TFrom, TSize extends number>(
    item: FixedSizeCodec<TFrom, TTo, TSize>,
    config: ZeroableNullableCodecConfig = {},
): FixedSizeCodec<TFrom | null, TTo | null, TSize> {
    return combineCodec(getZeroableNullableEncoder(item, config), getZeroableNullableDecoder(item, config));
}

function getZeroValue(itemSize: number, zeroValue?: ReadonlyUint8Array | undefined): ReadonlyUint8Array {
    const zeroValueOrDefault = zeroValue ?? new Uint8Array(itemSize).fill(0);
    if (zeroValueOrDefault.length !== itemSize) {
        throw new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, {
            codecDescription: 'zeroableNullable',
            expectedSize: itemSize,
            hexZeroValue: getBase16Decoder().decode(zeroValueOrDefault),
            zeroValue: zeroValueOrDefault,
        });
    }
    return zeroValueOrDefault;
}
