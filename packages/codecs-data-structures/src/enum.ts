import {
    Codec,
    combineCodec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    mapDecoder,
    mapEncoder,
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
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

/**
 * Defines the "lookup object" of an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * ```
 */
export type EnumLookupObject = { [key: string]: number | string };

/**
 * Returns the allowed input for an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionInput = GetEnumFrom<Direction>; // "Left" | "Right" | 0 | 1
 * ```
 */
type GetEnumFrom<TEnum extends EnumLookupObject> = TEnum[keyof TEnum] | keyof TEnum;

/**
 * Returns all the available variants of an enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionOutput = GetEnumTo<Direction>; // 0 | 1
 * ```
 */
type GetEnumTo<TEnum extends EnumLookupObject> = TEnum[keyof TEnum];

/** Defines the config for enum codecs. */
export type EnumCodecConfig<TDiscriminator extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * The codec to use for the enum discriminator.
     * @defaultValue u8 discriminator.
     */
    size?: TDiscriminator;
};

/**
 * Creates an enum encoder.
 *
 * @param constructor - The constructor of the enum.
 * @param config - A set of config for the encoder.
 */
export function getEnumEncoder<TEnum extends EnumLookupObject>(
    constructor: TEnum,
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
    const { minRange, maxRange, allStringInputs, enumKeys, enumValues } = getEnumStats(constructor);
    return mapEncoder(prefix, (value: GetEnumFrom<TEnum>): number => {
        const isInvalidNumber = typeof value === 'number' && (value < minRange || value > maxRange);
        const isInvalidString = typeof value === 'string' && !allStringInputs.includes(value);
        if (isInvalidNumber || isInvalidString) {
            throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                maxRange,
                minRange,
                value,
                variants: allStringInputs,
            });
        }
        if (typeof value === 'number') return value;
        const valueIndex = enumValues.indexOf(value as string);
        if (valueIndex >= 0) return valueIndex;
        return enumKeys.indexOf(value as string);
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
    const { minRange, maxRange, enumKeys } = getEnumStats(constructor);
    return mapDecoder(prefix, (value: bigint | number): GetEnumTo<TEnum> => {
        const valueAsNumber = Number(value);
        if (valueAsNumber < minRange || valueAsNumber > maxRange) {
            throw new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: valueAsNumber,
                maxRange,
                minRange,
            });
        }
        return constructor[enumKeys[valueAsNumber]] as GetEnumTo<TEnum>;
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

function getEnumStats<TEnum extends EnumLookupObject>(
    constructor: TEnum,
): {
    allStringInputs: string[];
    enumKeys: string[];
    enumValues: (number | string)[];
    maxRange: number;
    minRange: number;
} {
    const numericValues = Object.values(constructor).filter(v => typeof v === 'number') as number[];
    const deduplicatedConstructor = Object.fromEntries(
        Object.entries(constructor).slice(numericValues.length),
    ) as Record<string, number | string>;
    const enumKeys = Object.keys(deduplicatedConstructor);
    const enumValues = Object.values(deduplicatedConstructor);
    const minRange = 0;
    const maxRange = enumValues.length - 1;
    const allStringInputs: string[] = [
        ...new Set([...enumKeys, ...enumValues.filter((v): v is string => typeof v === 'string')]),
    ];

    return {
        allStringInputs,
        enumKeys,
        enumValues,
        maxRange,
        minRange,
    };
}

/** @deprecated Use `getEnumEncoder` instead. */
export const getScalarEnumEncoder = getEnumEncoder;

/** @deprecated Use `getEnumDecoder` instead. */
export const getScalarEnumDecoder = getEnumDecoder;

/** @deprecated Use `getEnumCodec` instead. */
export const getScalarEnumCodec = getEnumCodec;
