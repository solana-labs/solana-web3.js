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
import {
    SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT,
    SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

/** Defines the config for literal union codecs. */
export type LiteralUnionCodecConfig<TDiscriminator = NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * The number codec to use for the literal union discriminator.
     * @defaultValue u8 discriminator.
     */
    size?: TDiscriminator;
};

type Variant = bigint | boolean | number | string | null | undefined;
type GetTypeFromVariants<TVariants extends readonly Variant[]> = TVariants[number];

/**
 * Creates a literal union encoder.
 *
 * @param variants - The variant encoders of the literal union.
 * @param config - A set of config for the encoder.
 */
export function getLiteralUnionEncoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
): FixedSizeEncoder<GetTypeFromVariants<TVariants>, 1>;
export function getLiteralUnionEncoder<const TVariants extends readonly Variant[], TSize extends number>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberEncoder> & { size: FixedSizeNumberEncoder<TSize> },
): FixedSizeEncoder<GetTypeFromVariants<TVariants>, TSize>;
export function getLiteralUnionEncoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config?: LiteralUnionCodecConfig<NumberEncoder>,
): VariableSizeEncoder<GetTypeFromVariants<TVariants>>;
export function getLiteralUnionEncoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberEncoder> = {},
): Encoder<GetTypeFromVariants<TVariants>> {
    const discriminator = config.size ?? getU8Encoder();
    return transformEncoder(discriminator, variant => {
        const index = variants.indexOf(variant);
        if (index < 0) {
            throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT, {
                value: variant,
                variants,
            });
        }
        return index;
    });
}

/**
 * Creates a literal union decoder.
 *
 * @param variants - The variant decoders of the literal union.
 * @param config - A set of config for the decoder.
 */
export function getLiteralUnionDecoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
): FixedSizeDecoder<GetTypeFromVariants<TVariants>, 1>;
export function getLiteralUnionDecoder<const TVariants extends readonly Variant[], TSize extends number>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberDecoder> & { size: FixedSizeNumberDecoder<TSize> },
): FixedSizeDecoder<GetTypeFromVariants<TVariants>, TSize>;
export function getLiteralUnionDecoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config?: LiteralUnionCodecConfig<NumberDecoder>,
): VariableSizeDecoder<GetTypeFromVariants<TVariants>>;
export function getLiteralUnionDecoder<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberDecoder> = {},
): Decoder<GetTypeFromVariants<TVariants>> {
    const discriminator = config.size ?? getU8Decoder();
    return transformDecoder(discriminator, (index: bigint | number) => {
        if (index < 0 || index >= variants.length) {
            throw new SolanaError(SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: index,
                maxRange: variants.length - 1,
                minRange: 0,
            });
        }
        return variants[Number(index)];
    });
}

/**
 * Creates a literal union codec.
 *
 * @param variants - The variant codecs of the literal union.
 * @param config - A set of config for the codec.
 */

export function getLiteralUnionCodec<const TVariants extends readonly Variant[]>(
    variants: TVariants,
): FixedSizeCodec<GetTypeFromVariants<TVariants>, GetTypeFromVariants<TVariants>, 1>;
export function getLiteralUnionCodec<const TVariants extends readonly Variant[], TSize extends number>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberCodec> & { size: FixedSizeNumberCodec<TSize> },
): FixedSizeCodec<GetTypeFromVariants<TVariants>, GetTypeFromVariants<TVariants>, TSize>;
export function getLiteralUnionCodec<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config?: LiteralUnionCodecConfig<NumberCodec>,
): VariableSizeCodec<GetTypeFromVariants<TVariants>>;
export function getLiteralUnionCodec<const TVariants extends readonly Variant[]>(
    variants: TVariants,
    config: LiteralUnionCodecConfig<NumberCodec> = {},
): Codec<GetTypeFromVariants<TVariants>> {
    return combineCodec(getLiteralUnionEncoder(variants, config), getLiteralUnionDecoder(variants, config));
}
