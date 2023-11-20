import { BaseCodecConfig, Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

/** Defines the config for unit codecs. */
export type UnitSerializerconfig = BaseCodecConfig;

/**
 * Creates a void encoder.
 *
 * @param config - A set of config for the encoder.
 */
export function getUnitEncoder(config: UnitSerializerconfig = {}): Encoder<void> {
    return {
        description: config.description ?? 'unit',
        encode: () => new Uint8Array(),
        fixedSize: 0,
        maxSize: 0,
    };
}

/**
 * Creates a void decoder.
 *
 * @param config - A set of config for the decoder.
 */
export function getUnitDecoder(config: UnitSerializerconfig = {}): Decoder<void> {
    return {
        decode: (_bytes: Uint8Array, offset = 0) => [undefined, offset],
        description: config.description ?? 'unit',
        fixedSize: 0,
        maxSize: 0,
    };
}

/**
 * Creates a void codec.
 *
 * @param config - A set of config for the codec.
 */
export function getUnitCodec(config: UnitSerializerconfig = {}): Codec<void> {
    return combineCodec(getUnitEncoder(config), getUnitDecoder(config));
}
