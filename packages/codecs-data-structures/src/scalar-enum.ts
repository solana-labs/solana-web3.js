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
    SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

/**
 * Defines the "lookup object" of a scalar enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * ```
 */
export type ScalarEnum = { [key: string]: string | number };

/**
 * Returns the allowed input for a scalar enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionInput = ScalarEnumFrom<Direction>; // "Left" | "Right" | 0 | 1
 * ```
 */
export type ScalarEnumFrom<TEnum extends ScalarEnum> = keyof TEnum | TEnum[keyof TEnum];

/**
 * Returns all the available variants of a scalar enum.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionOutput = ScalarEnumFrom<Direction>; // 0 | 1
 * ```
 */
export type ScalarEnumTo<TEnum extends ScalarEnum> = TEnum[keyof TEnum];

/** Defines the config for scalar enum codecs. */
export type ScalarEnumCodecConfig<TDiscriminator extends NumberCodec | NumberEncoder | NumberDecoder> = {
    /**
     * The codec to use for the enum discriminator.
     * @defaultValue u8 discriminator.
     */
    size?: TDiscriminator;
};

/**
 * Creates a scalar enum encoder.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param config - A set of config for the encoder.
 */
export function getScalarEnumEncoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
): FixedSizeEncoder<ScalarEnumFrom<TEnum>, 1>;
export function getScalarEnumEncoder<TEnum extends ScalarEnum, TSize extends number>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberEncoder> & { size: FixedSizeNumberEncoder<TSize> },
): FixedSizeEncoder<ScalarEnumFrom<TEnum>, TSize>;
export function getScalarEnumEncoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config?: ScalarEnumCodecConfig<NumberEncoder>,
): VariableSizeEncoder<ScalarEnumFrom<TEnum>>;
export function getScalarEnumEncoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberEncoder> = {},
): Encoder<ScalarEnumFrom<TEnum>> {
    const prefix = config.size ?? getU8Encoder();
    const { minRange, maxRange, allStringInputs, enumKeys, enumValues } = getScalarEnumStats(constructor);
    return mapEncoder(prefix, (value: ScalarEnumFrom<TEnum>): number => {
        const isInvalidNumber = typeof value === 'number' && (value < minRange || value > maxRange);
        const isInvalidString = typeof value === 'string' && !allStringInputs.includes(value);
        if (isInvalidNumber || isInvalidString) {
            throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT, {
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
 * Creates a scalar enum decoder.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param config - A set of config for the decoder.
 */
export function getScalarEnumDecoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
): FixedSizeDecoder<ScalarEnumTo<TEnum>, 1>;
export function getScalarEnumDecoder<TEnum extends ScalarEnum, TSize extends number>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberDecoder> & { size: FixedSizeNumberDecoder<TSize> },
): FixedSizeDecoder<ScalarEnumTo<TEnum>, TSize>;
export function getScalarEnumDecoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config?: ScalarEnumCodecConfig<NumberDecoder>,
): VariableSizeDecoder<ScalarEnumTo<TEnum>>;
export function getScalarEnumDecoder<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberDecoder> = {},
): Decoder<ScalarEnumTo<TEnum>> {
    const prefix = config.size ?? getU8Decoder();
    const { minRange, maxRange, enumKeys } = getScalarEnumStats(constructor);
    return mapDecoder(prefix, (value: number | bigint): ScalarEnumTo<TEnum> => {
        const valueAsNumber = Number(value);
        if (valueAsNumber < minRange || valueAsNumber > maxRange) {
            throw new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: valueAsNumber,
                maxRange,
                minRange,
            });
        }
        return constructor[enumKeys[valueAsNumber]] as ScalarEnumTo<TEnum>;
    });
}

/**
 * Creates a scalar enum codec.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param config - A set of config for the codec.
 */
export function getScalarEnumCodec<TEnum extends ScalarEnum>(
    constructor: TEnum,
): FixedSizeCodec<ScalarEnumFrom<TEnum>, ScalarEnumTo<TEnum>, 1>;
export function getScalarEnumCodec<TEnum extends ScalarEnum, TSize extends number>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberCodec> & { size: FixedSizeNumberCodec<TSize> },
): FixedSizeCodec<ScalarEnumFrom<TEnum>, ScalarEnumTo<TEnum>, TSize>;
export function getScalarEnumCodec<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config?: ScalarEnumCodecConfig<NumberCodec>,
): VariableSizeCodec<ScalarEnumFrom<TEnum>, ScalarEnumTo<TEnum>>;
export function getScalarEnumCodec<TEnum extends ScalarEnum>(
    constructor: TEnum,
    config: ScalarEnumCodecConfig<NumberCodec> = {},
): Codec<ScalarEnumFrom<TEnum>, ScalarEnumTo<TEnum>> {
    return combineCodec(getScalarEnumEncoder(constructor, config), getScalarEnumDecoder(constructor, config));
}

function getScalarEnumStats<TEnum extends ScalarEnum>(
    constructor: TEnum,
): {
    allStringInputs: string[];
    enumKeys: string[];
    enumValues: (string | number)[];
    minRange: number;
    maxRange: number;
} {
    const numericValues = Object.values(constructor).filter(v => typeof v === 'number') as number[];
    const deduplicatedConstructor = Object.fromEntries(
        Object.entries(constructor).slice(numericValues.length),
    ) as Record<string, string | number>;
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
