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

import { getTupleDecoder, getTupleEncoder } from './tuple';

/**
 * Prefixes a given encoder with a list of void encoders.
 * All void encoders are hidden from the returned encoder.
 */
export function getHiddenPrefixEncoder<TFrom>(
    encoder: FixedSizeEncoder<TFrom>,
    prefixedEncoders: readonly FixedSizeEncoder<void>[],
): FixedSizeEncoder<TFrom>;
export function getHiddenPrefixEncoder<TFrom>(
    encoder: Encoder<TFrom>,
    prefixedEncoders: readonly Encoder<void>[],
): VariableSizeEncoder<TFrom>;
export function getHiddenPrefixEncoder<TFrom>(
    encoder: Encoder<TFrom>,
    prefixedEncoders: readonly Encoder<void>[],
): Encoder<TFrom> {
    return transformEncoder(
        getTupleEncoder([...prefixedEncoders, encoder]) as Encoder<readonly [...void[], TFrom]>,
        (value: TFrom) => [...prefixedEncoders.map(() => undefined), value] as const,
    );
}

/**
 * Prefixes a given decoder with a list of void decoder.
 * All void decoder are hidden from the returned decoder.
 */
export function getHiddenPrefixDecoder<TTo>(
    decoder: FixedSizeDecoder<TTo>,
    prefixedDecoders: readonly FixedSizeDecoder<void>[],
): FixedSizeDecoder<TTo>;
export function getHiddenPrefixDecoder<TTo>(
    decoder: Decoder<TTo>,
    prefixedDecoders: readonly Decoder<void>[],
): VariableSizeDecoder<TTo>;
export function getHiddenPrefixDecoder<TTo>(
    decoder: Decoder<TTo>,
    prefixedDecoders: readonly Decoder<void>[],
): Decoder<TTo> {
    return transformDecoder(
        getTupleDecoder([...prefixedDecoders, decoder]) as Decoder<readonly [...void[], TTo]>,
        tuple => tuple[tuple.length - 1] as TTo,
    );
}

/**
 * Prefixes a given codec with a list of void codec.
 * All void codec are hidden from the returned codec.
 */
export function getHiddenPrefixCodec<TFrom, TTo extends TFrom>(
    codec: FixedSizeCodec<TFrom, TTo>,
    prefixedCodecs: readonly FixedSizeCodec<void>[],
): FixedSizeCodec<TFrom, TTo>;
export function getHiddenPrefixCodec<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    prefixedCodecs: readonly Codec<void>[],
): VariableSizeCodec<TFrom, TTo>;
export function getHiddenPrefixCodec<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    prefixedCodecs: readonly Codec<void>[],
): Codec<TFrom, TTo> {
    return combineCodec(getHiddenPrefixEncoder(codec, prefixedCodecs), getHiddenPrefixDecoder(codec, prefixedCodecs));
}
