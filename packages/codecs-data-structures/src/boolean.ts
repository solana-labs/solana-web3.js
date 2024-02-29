import {
    assertIsFixedSize,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    mapDecoder,
    mapEncoder,
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
import {
    isSolanaError,
    SOLANA_ERROR__CODECS_CODEC_REQUIRES_FIXED_SIZE,
    SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH_GOT_VARIABLE_LENGTH,
    SolanaError,
} from '@solana/errors';

/** Defines the config for boolean codecs. */
export type BooleanCodecConfig<TSize extends NumberCodec | NumberEncoder | NumberDecoder> = {
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
export function getBooleanEncoder(config: BooleanCodecConfig<NumberEncoder>): Encoder<boolean>;
export function getBooleanEncoder(config: BooleanCodecConfig<NumberEncoder> = {}): Encoder<boolean> {
    const size = config.size ?? getU8Encoder();
    try {
        assertIsFixedSize(size);
    } catch (e) {
        if (isSolanaError(e, SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH_GOT_VARIABLE_LENGTH)) {
            throw new SolanaError(SOLANA_ERROR__CODECS_CODEC_REQUIRES_FIXED_SIZE, {
                codecDescription: 'bool',
            });
        } else {
            throw e;
        }
    }
    return mapEncoder(size, (value: boolean) => (value ? 1 : 0));
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
export function getBooleanDecoder(config: BooleanCodecConfig<NumberDecoder>): Decoder<boolean>;
export function getBooleanDecoder(config: BooleanCodecConfig<NumberDecoder> = {}): Decoder<boolean> {
    const size = config.size ?? getU8Decoder();
    try {
        assertIsFixedSize(size);
    } catch (e) {
        if (isSolanaError(e, SOLANA_ERROR__CODECS_EXPECTED_FIXED_LENGTH_GOT_VARIABLE_LENGTH)) {
            throw new SolanaError(SOLANA_ERROR__CODECS_CODEC_REQUIRES_FIXED_SIZE, {
                codecDescription: 'bool',
            });
        } else {
            throw e;
        }
    }
    return mapDecoder(size, (value: number | bigint): boolean => Number(value) === 1);
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
export function getBooleanCodec(config: BooleanCodecConfig<NumberCodec>): Codec<boolean>;
export function getBooleanCodec(config: BooleanCodecConfig<NumberCodec> = {}): Codec<boolean> {
    return combineCodec(getBooleanEncoder(config), getBooleanDecoder(config));
}
