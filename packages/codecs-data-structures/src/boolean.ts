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

/** Defines the config for boolean codecs. */
export type BooleanCodecConfig<TSize extends NumberCodec | NumberDecoder | NumberEncoder> = {
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
export function getBooleanEncoder(): FixedSizeEncoder<boolean, 1>;
export function getBooleanEncoder<TSize extends number>(
    config: BooleanCodecConfig<NumberEncoder> & { size: FixedSizeNumberEncoder<TSize> },
): FixedSizeEncoder<boolean, TSize>;
export function getBooleanEncoder(config: BooleanCodecConfig<NumberEncoder>): VariableSizeEncoder<boolean>;
export function getBooleanEncoder(config: BooleanCodecConfig<NumberEncoder> = {}): Encoder<boolean> {
    return transformEncoder(config.size ?? getU8Encoder(), (value: boolean) => (value ? 1 : 0));
}

/**
 * Decodes booleans.
 *
 * @param config - A set of config for the decoder.
 */
export function getBooleanDecoder(): FixedSizeDecoder<boolean, 1>;
export function getBooleanDecoder<TSize extends number>(
    config: BooleanCodecConfig<NumberDecoder> & { size: FixedSizeNumberDecoder<TSize> },
): FixedSizeDecoder<boolean, TSize>;
export function getBooleanDecoder(config: BooleanCodecConfig<NumberDecoder>): VariableSizeDecoder<boolean>;
export function getBooleanDecoder(config: BooleanCodecConfig<NumberDecoder> = {}): Decoder<boolean> {
    return transformDecoder(config.size ?? getU8Decoder(), (value: bigint | number): boolean => Number(value) === 1);
}

/**
 * Creates a boolean codec.
 *
 * @param config - A set of config for the codec.
 */
export function getBooleanCodec(): FixedSizeCodec<boolean, boolean, 1>;
export function getBooleanCodec<TSize extends number>(
    config: BooleanCodecConfig<NumberCodec> & { size: FixedSizeNumberCodec<TSize> },
): FixedSizeCodec<boolean, boolean, TSize>;
export function getBooleanCodec(config: BooleanCodecConfig<NumberCodec>): VariableSizeCodec<boolean>;
export function getBooleanCodec(config: BooleanCodecConfig<NumberCodec> = {}): Codec<boolean> {
    return combineCodec(getBooleanEncoder(config), getBooleanDecoder(config));
}
