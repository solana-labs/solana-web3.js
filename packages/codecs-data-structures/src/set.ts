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

/** Defines the config for set codecs. */
export type SetCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * The size of the set.
     * @defaultValue u32 prefix.
     */
    size?: ArrayLikeCodecSize<TPrefix>;
};

/**
 * Encodes an set of items.
 *
 * @param item - The encoder to use for the set's items.
 * @param config - A set of config for the encoder.
 */
export function getSetEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: SetCodecConfig<NumberEncoder> & { size: 0 },
): FixedSizeEncoder<Set<TFrom>, 0>;
export function getSetEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: SetCodecConfig<NumberEncoder> & { size: number },
): FixedSizeEncoder<Set<TFrom>>;
export function getSetEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: SetCodecConfig<NumberEncoder>,
): VariableSizeEncoder<Set<TFrom>>;
export function getSetEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: SetCodecConfig<NumberEncoder> = {},
): Encoder<Set<TFrom>> {
    return transformEncoder(getArrayEncoder(item, config as object), (set: Set<TFrom>): TFrom[] => [...set]);
}

/**
 * Decodes an set of items.
 *
 * @param item - The encoder to use for the set's items.
 * @param config - A set of config for the encoder.
 */
export function getSetDecoder<TTo>(
    item: Decoder<TTo>,
    config: SetCodecConfig<NumberDecoder> & { size: 0 },
): FixedSizeDecoder<Set<TTo>, 0>;
export function getSetDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: SetCodecConfig<NumberDecoder> & { size: number },
): FixedSizeDecoder<Set<TTo>>;
export function getSetDecoder<TTo>(
    item: Decoder<TTo>,
    config?: SetCodecConfig<NumberDecoder>,
): VariableSizeDecoder<Set<TTo>>;
export function getSetDecoder<TTo>(item: Decoder<TTo>, config: SetCodecConfig<NumberDecoder> = {}): Decoder<Set<TTo>> {
    return transformDecoder(getArrayDecoder(item, config as object), (entries: TTo[]): Set<TTo> => new Set(entries));
}

/**
 * Creates a codec for an set of items.
 *
 * @param item - The codec to use for the set's items.
 * @param config - A set of config for the codec.
 */
export function getSetCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: SetCodecConfig<NumberCodec> & { size: 0 },
): FixedSizeCodec<Set<TFrom>, Set<TTo>, 0>;
export function getSetCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: SetCodecConfig<NumberCodec> & { size: number },
): FixedSizeCodec<Set<TFrom>, Set<TTo>>;
export function getSetCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: SetCodecConfig<NumberCodec>,
): VariableSizeCodec<Set<TFrom>, Set<TTo>>;
export function getSetCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: SetCodecConfig<NumberCodec> = {},
): Codec<Set<TFrom>, Set<TTo>> {
    return combineCodec(getSetEncoder(item, config as object), getSetDecoder(item, config as object));
}
