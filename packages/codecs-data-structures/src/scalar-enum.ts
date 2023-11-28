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

/**
 * Defines a scalar enum as a type from its constructor.
 *
 * @example
 * ```ts
 * enum Direction { Left, Right };
 * type DirectionType = ScalarEnum<Direction>;
 * ```
 */
export type ScalarEnum<T> = ({ [key: number | string]: string | number | T } | number | T) & NonNullable<unknown>;

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
export function getScalarEnumEncoder<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor
): FixedSizeEncoder<TFrom, 1>;
export function getScalarEnumEncoder<TFrom, TFromConstructor extends ScalarEnum<TFrom>, TSize extends number>(
    constructor: TFromConstructor,
    config: ScalarEnumCodecConfig<NumberEncoder> & { size: FixedSizeNumberEncoder<TSize> }
): FixedSizeEncoder<TFrom, TSize>;
export function getScalarEnumEncoder<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor,
    config?: ScalarEnumCodecConfig<NumberEncoder>
): VariableSizeEncoder<TFrom>;
export function getScalarEnumEncoder<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor,
    config: ScalarEnumCodecConfig<NumberEncoder> = {}
): Encoder<TFrom> {
    const prefix = config.size ?? getU8Encoder();
    const { minRange, maxRange, stringValues, enumKeys, enumValues } = getScalarEnumStats(constructor);
    return mapEncoder(prefix, (value: TFrom): number => {
        const isInvalidNumber = typeof value === 'number' && (value < minRange || value > maxRange);
        const isInvalidString = typeof value === 'string' && !stringValues.includes(value);
        if (isInvalidNumber || isInvalidString) {
            // TODO: Coded error.
            throw new Error(
                `Invalid scalar enum variant. ` +
                    `Expected one of [${stringValues.join(', ')}] ` +
                    `or a number between ${minRange} and ${maxRange}, ` +
                    `got "${value}".`
            );
        }
        if (typeof value === 'number') return value;
        const valueIndex = enumValues.indexOf(value);
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
export function getScalarEnumDecoder<TTo, TToConstructor extends ScalarEnum<TTo>>(
    constructor: TToConstructor
): FixedSizeDecoder<TTo, 1>;
export function getScalarEnumDecoder<TTo, TToConstructor extends ScalarEnum<TTo>, TSize extends number>(
    constructor: TToConstructor,
    config: ScalarEnumCodecConfig<NumberDecoder> & { size: FixedSizeNumberDecoder<TSize> }
): FixedSizeDecoder<TTo, TSize>;
export function getScalarEnumDecoder<TTo, TToConstructor extends ScalarEnum<TTo>>(
    constructor: TToConstructor,
    config?: ScalarEnumCodecConfig<NumberDecoder>
): VariableSizeDecoder<TTo>;
export function getScalarEnumDecoder<TTo, TToConstructor extends ScalarEnum<TTo>>(
    constructor: TToConstructor,
    config: ScalarEnumCodecConfig<NumberDecoder> = {}
): Decoder<TTo> {
    const prefix = config.size ?? getU8Decoder();
    const { minRange, maxRange, isNumericEnum, enumValues } = getScalarEnumStats(constructor);
    return mapDecoder(prefix, (value: number | bigint): TTo => {
        const valueAsNumber = Number(value);
        if (valueAsNumber < minRange || valueAsNumber > maxRange) {
            // TODO: Coded error.
            throw new Error(
                `Enum discriminator out of range. ` +
                    `Expected a number between ${minRange} and ${maxRange}, got ${valueAsNumber}.`
            );
        }
        return (isNumericEnum ? valueAsNumber : enumValues[valueAsNumber]) as TTo;
    });
}

/**
 * Creates a scalar enum codec.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param config - A set of config for the codec.
 */
export function getScalarEnumCodec<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor
): FixedSizeCodec<TFrom, TFrom, 1>;
export function getScalarEnumCodec<TFrom, TFromConstructor extends ScalarEnum<TFrom>, TSize extends number>(
    constructor: TFromConstructor,
    config: ScalarEnumCodecConfig<NumberCodec> & { size: FixedSizeNumberCodec<TSize> }
): FixedSizeCodec<TFrom, TFrom, TSize>;
export function getScalarEnumCodec<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor,
    config?: ScalarEnumCodecConfig<NumberCodec>
): VariableSizeCodec<TFrom>;
export function getScalarEnumCodec<TFrom, TFromConstructor extends ScalarEnum<TFrom>>(
    constructor: TFromConstructor,
    config: ScalarEnumCodecConfig<NumberCodec> = {}
): Codec<TFrom> {
    return combineCodec(getScalarEnumEncoder(constructor, config), getScalarEnumDecoder(constructor, config));
}

function getScalarEnumStats<TFrom>(constructor: ScalarEnum<TFrom>): {
    enumKeys: string[];
    enumValues: TFrom[];
    isNumericEnum: boolean;
    minRange: number;
    maxRange: number;
    stringValues: string[];
} {
    const enumKeys = Object.keys(constructor);
    const enumValues = Object.values(constructor);
    const isNumericEnum = enumValues.some(v => typeof v === 'number');
    const minRange = 0;
    const maxRange = isNumericEnum ? enumValues.length / 2 - 1 : enumValues.length - 1;
    const stringValues: string[] = isNumericEnum ? [...enumKeys] : [...new Set([...enumKeys, ...enumValues])];

    return {
        enumKeys,
        enumValues,
        isNumericEnum,
        maxRange,
        minRange,
        stringValues,
    };
}
