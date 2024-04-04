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
import { getBytesDecoder, getBytesEncoder, getUnionDecoder, getUnionEncoder } from '@solana/codecs-data-structures';
import { getBase16Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, SolanaError } from '@solana/errors';

import { isOption, isSome, None, none, Option, OptionOrNullable, Some, some } from './option';
import { wrapNullable } from './unwrap-option';

/** Defines the config for zeroable option codecs. */
export type ZeroableOptionCodecConfig = {
    /**
     * Defines what the zero value is for the codec.
     * When decoding this exact value, it will be treated as `None`.
     *
     * Note that the provided byte array must be the same length as the
     * codec's fixed size.
     * @defaultValue A `Uint8Array` full of zeros.
     */
    zeroValue?: ReadonlyUint8Array;
};

/**
 * Creates a encoder for an optional value using the `Option<T>` type.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `None`.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getZeroableOptionEncoder<TFrom, TSize extends number>(
    item: FixedSizeEncoder<TFrom, TSize>,
    config: ZeroableOptionCodecConfig = {},
): FixedSizeEncoder<OptionOrNullable<TFrom>, TSize> {
    const zeroValue = getZeroValue(item.fixedSize, config.zeroValue);
    return getUnionEncoder(
        [
            transformEncoder(fixEncoderSize(getBytesEncoder(), item.fixedSize), (_value: None | null) => zeroValue),
            transformEncoder(item, (value: Some<TFrom> | TFrom) =>
                isOption(value) && isSome(value) ? value.value : value,
            ),
        ],
        (variant: OptionOrNullable<TFrom>) => {
            const option = isOption<TFrom>(variant) ? variant : wrapNullable(variant);
            return Number(isSome(option));
        },
    ) as FixedSizeEncoder<OptionOrNullable<TFrom>, TSize>;
}

/**
 * Creates a decoder for an optional value using the `Option<T>` type.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `None`.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getZeroableOptionDecoder<TTo, TSize extends number>(
    item: FixedSizeDecoder<TTo, TSize>,
    config: ZeroableOptionCodecConfig = {},
): FixedSizeDecoder<Option<TTo>, TSize> {
    const zeroValue = getZeroValue(item.fixedSize, config.zeroValue);
    return getUnionDecoder(
        [
            transformDecoder(fixDecoderSize(getBytesDecoder(), item.fixedSize), () => none<TTo>()),
            transformDecoder(item, value => some(value)),
        ],
        (bytes, offset) => (containsBytes(bytes, zeroValue, offset) ? 0 : 1),
    ) as FixedSizeDecoder<Option<TTo>, TSize>;
}

/**
 * Creates a codec for an optional value using the `Option<T>` type.
 * Instead of using a boolean prefix, this codec uses a zero value to represent `None`.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getZeroableOptionCodec<TFrom, TTo extends TFrom, TSize extends number>(
    item: FixedSizeCodec<TFrom, TTo, TSize>,
    config: ZeroableOptionCodecConfig = {},
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>, TSize> {
    return combineCodec(getZeroableOptionEncoder(item, config), getZeroableOptionDecoder(item, config));
}

function getZeroValue(itemSize: number, zeroValue?: ReadonlyUint8Array | undefined): ReadonlyUint8Array {
    const zeroValueOrDefault = zeroValue ?? new Uint8Array(itemSize).fill(0);
    if (zeroValueOrDefault.length !== itemSize) {
        throw new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, {
            codecDescription: 'zeroableOption',
            expectedSize: itemSize,
            hexZeroValue: getBase16Decoder().decode(zeroValueOrDefault),
            zeroValue: zeroValueOrDefault,
        });
    }
    return zeroValueOrDefault;
}
