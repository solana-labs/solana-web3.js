import {
    assertByteArrayIsNotEmptyForCodec,
    assertFixedSizeCodec,
    BaseCodecConfig,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

/** Defines the config for boolean codecs. */
export type BooleanCodecConfig<TSize extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecConfig & {
    /**
     * The number codec to delegate to.
     * @defaultValue u8 size.
     */
    size?: TSize;
};

/**
 * Encodes booleans.
 *
 * @param config - A set of config for the encoder.
 */
export function getBooleanEncoder(config: BooleanCodecConfig<NumberEncoder> = {}): Encoder<boolean> {
    const size = config.size ?? getU8Encoder();
    assertFixedSizeCodec(size, 'Codec [bool] requires a fixed size.');

    return {
        description: config.description ?? `bool(${size.description})`,
        encode: (value: boolean) => size.encode(value ? 1 : 0),
        fixedSize: size.fixedSize,
        maxSize: size.fixedSize,
    };
}

/**
 * Decodes booleans.
 *
 * @param config - A set of config for the decoder.
 */
export function getBooleanDecoder(config: BooleanCodecConfig<NumberDecoder> = {}): Decoder<boolean> {
    const size = config.size ?? getU8Decoder();
    assertFixedSizeCodec(size, 'Codec [bool] requires a fixed size.');

    return {
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('bool', bytes, offset);
            const [value, vOffset] = size.decode(bytes, offset);
            return [value === 1, vOffset];
        },
        description: config.description ?? `bool(${size.description})`,
        fixedSize: size.fixedSize,
        maxSize: size.fixedSize,
    };
}

/**
 * Creates a boolean codec.
 *
 * @param config - A set of config for the codec.
 */
export function getBooleanCodec(config: BooleanCodecConfig<NumberCodec> = {}): Codec<boolean> {
    return combineCodec(getBooleanEncoder(config), getBooleanDecoder(config));
}
