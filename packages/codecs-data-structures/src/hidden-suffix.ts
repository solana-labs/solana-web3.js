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
 * Suffixes a given encoder with a list of void encoders.
 * All void encoders are hidden from the returned encoder.
 */
export function getHiddenSuffixEncoder<TFrom>(
    encoder: FixedSizeEncoder<TFrom>,
    suffixedEncoders: readonly FixedSizeEncoder<void>[],
): FixedSizeEncoder<TFrom>;
export function getHiddenSuffixEncoder<TFrom>(
    encoder: Encoder<TFrom>,
    suffixedEncoders: readonly Encoder<void>[],
): VariableSizeEncoder<TFrom>;
export function getHiddenSuffixEncoder<TFrom>(
    encoder: Encoder<TFrom>,
    suffixedEncoders: readonly Encoder<void>[],
): Encoder<TFrom> {
    return transformEncoder(
        getTupleEncoder([encoder, ...suffixedEncoders]) as Encoder<readonly [TFrom, ...void[]]>,
        (value: TFrom) => [value, ...suffixedEncoders.map(() => undefined)] as const,
    );
}

/**
 * Suffixes a given decoder with a list of void decoder.
 * All void decoder are hidden from the returned decoder.
 */
export function getHiddenSuffixDecoder<TTo>(
    decoder: FixedSizeDecoder<TTo>,
    suffixedDecoders: readonly FixedSizeDecoder<void>[],
): FixedSizeDecoder<TTo>;
export function getHiddenSuffixDecoder<TTo>(
    decoder: Decoder<TTo>,
    suffixedDecoders: readonly Decoder<void>[],
): VariableSizeDecoder<TTo>;
export function getHiddenSuffixDecoder<TTo>(
    decoder: Decoder<TTo>,
    suffixedDecoders: readonly Decoder<void>[],
): Decoder<TTo> {
    return transformDecoder(
        getTupleDecoder([decoder, ...suffixedDecoders]) as Decoder<readonly [TTo, ...void[]]>,
        tuple => tuple[0],
    );
}

/**
 * Suffixes a given codec with a list of void codec.
 * All void codec are hidden from the returned codec.
 */
export function getHiddenSuffixCodec<TFrom, TTo extends TFrom>(
    codec: FixedSizeCodec<TFrom, TTo>,
    suffixedCodecs: readonly FixedSizeCodec<void>[],
): FixedSizeCodec<TFrom, TTo>;
export function getHiddenSuffixCodec<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    suffixedCodecs: readonly Codec<void>[],
): VariableSizeCodec<TFrom, TTo>;
export function getHiddenSuffixCodec<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    suffixedCodecs: readonly Codec<void>[],
): Codec<TFrom, TTo> {
    return combineCodec(getHiddenSuffixEncoder(codec, suffixedCodecs), getHiddenSuffixDecoder(codec, suffixedCodecs));
}
