/* eslint-disable sort-keys-fix/sort-keys-fix */
import { BaseCodecOptions, Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

/** Defines the options for unit codecs. */
export type UnitSerializerOptions = BaseCodecOptions;

/**
 * Creates a void encoder.
 *
 * @param options - A set of options for the encoder.
 */
export function getUnitEncoder(options: UnitSerializerOptions = {}): Encoder<void> {
    return {
        description: options.description ?? 'unit',
        fixedSize: 0,
        maxSize: 0,
        encode: () => new Uint8Array(),
    };
}

/**
 * Creates a void decoder.
 *
 * @param options - A set of options for the decoder.
 */
export function getUnitDecoder(options: UnitSerializerOptions = {}): Decoder<void> {
    return {
        description: options.description ?? 'unit',
        fixedSize: 0,
        maxSize: 0,
        decode: (_bytes: Uint8Array, offset = 0) => [undefined, offset],
    };
}

/**
 * Creates a void codec.
 *
 * @param options - A set of options for the codec.
 */
export function getUnitCodec(options: UnitSerializerOptions = {}): Codec<void> {
    return combineCodec(getUnitEncoder(options), getUnitDecoder(options));
}
