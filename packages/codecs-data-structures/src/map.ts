import {
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    transformDecoder,
    transformEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { ArrayLikeCodecSize, getArrayDecoder, getArrayEncoder } from './array';
import { getTupleDecoder, getTupleEncoder } from './tuple';

/** Defines the config for Map codecs. */
export type MapCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * The size of the array.
     * @defaultValue u32 prefix.
     */
    size?: ArrayLikeCodecSize<TPrefix>;
};

/**
 * Creates a encoder for a map.
 *
 * @param key - The encoder to use for the map's keys.
 * @param value - The encoder to use for the map's values.
 * @param config - A set of config for the encoder.
 */
export function getMapEncoder<TFromKey, TFromValue>(
    key: Encoder<TFromKey>,
    value: Encoder<TFromValue>,
    config: MapCodecConfig<NumberEncoder> & { size: 0 },
): FixedSizeEncoder<Map<TFromKey, TFromValue>, 0>;
export function getMapEncoder<TFromKey, TFromValue>(
    key: FixedSizeEncoder<TFromKey>,
    value: FixedSizeEncoder<TFromValue>,
    config: MapCodecConfig<NumberEncoder> & { size: number },
): FixedSizeEncoder<Map<TFromKey, TFromValue>>;
export function getMapEncoder<TFromKey, TFromValue>(
    key: Encoder<TFromKey>,
    value: Encoder<TFromValue>,
    config?: MapCodecConfig<NumberEncoder>,
): VariableSizeEncoder<Map<TFromKey, TFromValue>>;
export function getMapEncoder<TFromKey, TFromValue>(
    key: Encoder<TFromKey>,
    value: Encoder<TFromValue>,
    config: MapCodecConfig<NumberEncoder> = {},
): Encoder<Map<TFromKey, TFromValue>> {
    return transformEncoder(
        getArrayEncoder(getTupleEncoder([key, value]), config as object),
        (map: Map<TFromKey, TFromValue>): [TFromKey, TFromValue][] => [...map.entries()],
    );
}

/**
 * Creates a decoder for a map.
 *
 * @param key - The decoder to use for the map's keys.
 * @param value - The decoder to use for the map's values.
 * @param config - A set of config for the decoder.
 */
export function getMapDecoder<TToKey, TToValue>(
    key: Decoder<TToKey>,
    value: Decoder<TToValue>,
    config: MapCodecConfig<NumberDecoder> & { size: 0 },
): FixedSizeDecoder<Map<TToKey, TToValue>, 0>;
export function getMapDecoder<TToKey, TToValue>(
    key: FixedSizeDecoder<TToKey>,
    value: FixedSizeDecoder<TToValue>,
    config: MapCodecConfig<NumberDecoder> & { size: number },
): FixedSizeDecoder<Map<TToKey, TToValue>>;
export function getMapDecoder<TToKey, TToValue>(
    key: Decoder<TToKey>,
    value: Decoder<TToValue>,
    config?: MapCodecConfig<NumberDecoder>,
): VariableSizeDecoder<Map<TToKey, TToValue>>;
export function getMapDecoder<TToKey, TToValue>(
    key: Decoder<TToKey>,
    value: Decoder<TToValue>,
    config: MapCodecConfig<NumberDecoder> = {},
): Decoder<Map<TToKey, TToValue>> {
    return transformDecoder(
        getArrayDecoder(getTupleDecoder([key, value]), config as object) as Decoder<[TToKey, TToValue][]>,
        (entries: [TToKey, TToValue][]): Map<TToKey, TToValue> => new Map(entries),
    );
}

/**
 * Creates a codec for a map.
 *
 * @param key - The codec to use for the map's keys.
 * @param value - The codec to use for the map's values.
 * @param config - A set of config for the codec.
 */
export function getMapCodec<
    TFromKey,
    TFromValue,
    TToKey extends TFromKey = TFromKey,
    TToValue extends TFromValue = TFromValue,
>(
    key: Codec<TFromKey, TToKey>,
    value: Codec<TFromValue, TToValue>,
    config: MapCodecConfig<NumberCodec> & { size: 0 },
): FixedSizeCodec<Map<TFromKey, TFromValue>, Map<TToKey, TToValue>, 0>;
export function getMapCodec<
    TFromKey,
    TFromValue,
    TToKey extends TFromKey = TFromKey,
    TToValue extends TFromValue = TFromValue,
>(
    key: FixedSizeCodec<TFromKey, TToKey>,
    value: FixedSizeCodec<TFromValue, TToValue>,
    config: MapCodecConfig<NumberCodec> & { size: number },
): FixedSizeCodec<Map<TFromKey, TFromValue>, Map<TToKey, TToValue>>;
export function getMapCodec<
    TFromKey,
    TFromValue,
    TToKey extends TFromKey = TFromKey,
    TToValue extends TFromValue = TFromValue,
>(
    key: Codec<TFromKey, TToKey>,
    value: Codec<TFromValue, TToValue>,
    config?: MapCodecConfig<NumberCodec>,
): VariableSizeCodec<Map<TFromKey, TFromValue>, Map<TToKey, TToValue>>;
export function getMapCodec<
    TFromKey,
    TFromValue,
    TToKey extends TFromKey = TFromKey,
    TToValue extends TFromValue = TFromValue,
>(
    key: Codec<TFromKey, TToKey>,
    value: Codec<TFromValue, TToValue>,
    config: MapCodecConfig<NumberCodec> = {},
): Codec<Map<TFromKey, TFromValue>, Map<TToKey, TToValue>> {
    return combineCodec(getMapEncoder(key, value, config as object), getMapDecoder(key, value, config as object));
}
