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
    SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS,
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import {
    EnumLookupObject,
    formatNumericalValues,
    GetEnumFrom,
    getEnumIndexFromDiscriminator,
    getEnumIndexFromVariant,
    getEnumStats,
    GetEnumTo,
} from './enum-helpers';

/** Defines the config for enum codecs. */
export type EnumCodecConfig<TDiscriminator extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * The codec to use for the enum discriminator.
     * @defaultValue u8 discriminator.
     */
    size?: TDiscriminator;

    /**
     * When set to `true`, numeric values will be used as discriminantors and
     * an error will be thrown if a string value is found on the enum.
     * @defaultValue `false`
     */
    useValuesAsDiscriminators?: boolean;
};

/**
 * Creates an enum encoder.
 *
 * @param constructor - The constructor of the enum.
 * @param config - A set of config for the encoder.
 */
export function getEnumEncoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: Omit<EnumCodecConfig<NumberEncoder>, 'size'>,
): FixedSizeEncoder<GetEnumFrom<TEnum>, 1>;
export function getEnumEncoder<TEnum extends EnumLookupObject, TSize extends number>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberEncoder> & { size: FixedSizeNumberEncoder<TSize> },
): FixedSizeEncoder<GetEnumFrom<TEnum>, TSize>;
export function getEnumEncoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: EnumCodecConfig<NumberEncoder>,
): VariableSizeEncoder<GetEnumFrom<TEnum>>;
export function getEnumEncoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberEncoder> = {},
): Encoder<GetEnumFrom<TEnum>> {
    const prefix = config.size ?? getU8Encoder();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues, stringValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some(value => typeof value === 'string')) {
        throw new SolanaError(SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS, {
            stringValues: enumValues.filter((v): v is string => typeof v === 'string'),
        });
    }
    return transformEncoder(prefix, (variant: GetEnumFrom<TEnum>): number => {
        const index = getEnumIndexFromVariant({ enumKeys, enumValues, variant });
        if (index < 0) {
            throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                formattedNumericalValues: formatNumericalValues(numericalValues),
                numericalValues,
                stringValues,
                variant,
            });
        }
        return useValuesAsDiscriminators ? (enumValues[index] as number) : index;
    });
}

/**
 * Creates an enum decoder.
 *
 * @param constructor - The constructor of the enum.
 * @param config - A set of config for the decoder.
 */
export function getEnumDecoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: Omit<EnumCodecConfig<NumberDecoder>, 'size'>,
): FixedSizeDecoder<GetEnumTo<TEnum>, 1>;
export function getEnumDecoder<TEnum extends EnumLookupObject, TSize extends number>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberDecoder> & { size: FixedSizeNumberDecoder<TSize> },
): FixedSizeDecoder<GetEnumTo<TEnum>, TSize>;
export function getEnumDecoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: EnumCodecConfig<NumberDecoder>,
): VariableSizeDecoder<GetEnumTo<TEnum>>;
export function getEnumDecoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberDecoder> = {},
): Decoder<GetEnumTo<TEnum>> {
    const prefix = config.size ?? getU8Decoder();
    const useValuesAsDiscriminators = config.useValuesAsDiscriminators ?? false;
    const { enumKeys, enumValues, numericalValues } = getEnumStats(constructor);
    if (useValuesAsDiscriminators && enumValues.some(value => typeof value === 'string')) {
        throw new SolanaError(SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS, {
            stringValues: enumValues.filter((v): v is string => typeof v === 'string'),
        });
    }
    return transformDecoder(prefix, (value: bigint | number): GetEnumTo<TEnum> => {
        const discriminator = Number(value);
        const index = getEnumIndexFromDiscriminator({
            discriminator,
            enumKeys,
            enumValues,
            useValuesAsDiscriminators,
        });
        if (index < 0) {
            const validDiscriminators = useValuesAsDiscriminators
                ? numericalValues
                : [...Array(enumKeys.length).keys()];
            throw new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator,
                formattedValidDiscriminators: formatNumericalValues(validDiscriminators),
                validDiscriminators,
            });
        }
        return enumValues[index] as GetEnumTo<TEnum>;
    });
}

/**
 * Creates an enum codec.
 *
 * @param constructor - The constructor of the enum.
 * @param config - A set of config for the codec.
 */
export function getEnumCodec<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: Omit<EnumCodecConfig<NumberCodec>, 'size'>,
): FixedSizeCodec<GetEnumFrom<TEnum>, GetEnumTo<TEnum>, 1>;
export function getEnumCodec<TEnum extends EnumLookupObject, TSize extends number>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberCodec> & { size: FixedSizeNumberCodec<TSize> },
): FixedSizeCodec<GetEnumFrom<TEnum>, GetEnumTo<TEnum>, TSize>;
export function getEnumCodec<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config?: EnumCodecConfig<NumberCodec>,
): VariableSizeCodec<GetEnumFrom<TEnum>, GetEnumTo<TEnum>>;
export function getEnumCodec<TEnum extends EnumLookupObject>(
    constructor: TEnum,
    config: EnumCodecConfig<NumberCodec> = {},
): Codec<GetEnumFrom<TEnum>, GetEnumTo<TEnum>> {
    return combineCodec(getEnumEncoder(constructor, config), getEnumDecoder(constructor, config));
}

/** @deprecated Use `getEnumEncoder` instead. */
export const getScalarEnumEncoder = getEnumEncoder;

/** @deprecated Use `getEnumDecoder` instead. */
export const getScalarEnumDecoder = getEnumDecoder;

/** @deprecated Use `getEnumCodec` instead. */
export const getScalarEnumCodec = getEnumCodec;
