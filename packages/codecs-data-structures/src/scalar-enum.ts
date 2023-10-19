import {
    assertByteArrayIsNotEmptyForCodec,
    BaseCodecOptions,
    Codec,
    CodecData,
    combineCodec,
    Decoder,
    Encoder,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

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

/** Defines the options for scalar enum codecs. */
export type ScalarEnumCodecOptions<TDiscriminator extends NumberCodec | NumberEncoder | NumberDecoder> =
    BaseCodecOptions & {
        /**
         * The codec to use for the enum discriminator.
         * @defaultValue u8 discriminator.
         */
        size?: TDiscriminator;
    };

function scalarEnumCoderHelper<T>(
    constructor: ScalarEnum<T>,
    prefix: CodecData,
    description?: string
): CodecData & {
    enumKeys: string[];
    enumValues: T[];
    isNumericEnum: boolean;
    minRange: number;
    maxRange: number;
    stringValues: string[];
} {
    const enumKeys = Object.keys(constructor);
    const enumValues = Object.values(constructor);
    const isNumericEnum = enumValues.some(v => typeof v === 'number');
    const valueDescriptions = enumValues.filter(v => typeof v === 'string').join(', ');
    const minRange = 0;
    const maxRange = isNumericEnum ? enumValues.length / 2 - 1 : enumValues.length - 1;
    const stringValues: string[] = isNumericEnum ? [...enumKeys] : [...new Set([...enumKeys, ...enumValues])];

    return {
        description: description ?? `enum(${valueDescriptions}; ${prefix.description})`,
        enumKeys,
        enumValues,
        fixedSize: prefix.fixedSize,
        isNumericEnum,
        maxRange,
        maxSize: prefix.maxSize,
        minRange,
        stringValues,
    };
}

/**
 * Creates a scalar enum encoder.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param options - A set of options for the encoder.
 */
export function getScalarEnumEncoder<T>(
    constructor: ScalarEnum<T>,
    options: ScalarEnumCodecOptions<NumberEncoder> = {}
): Encoder<T> {
    const prefix = options.size ?? getU8Encoder();
    const { description, fixedSize, maxSize, minRange, maxRange, stringValues, enumKeys, enumValues } =
        scalarEnumCoderHelper(constructor, prefix, options.description);
    return {
        description,
        encode: (value: T) => {
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
            if (typeof value === 'number') return prefix.encode(value);
            const valueIndex = enumValues.indexOf(value);
            if (valueIndex >= 0) return prefix.encode(valueIndex);
            return prefix.encode(enumKeys.indexOf(value as string));
        },
        fixedSize,
        maxSize,
    };
}

/**
 * Creates a scalar enum decoder.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param options - A set of options for the decoder.
 */
export function getScalarEnumDecoder<T>(
    constructor: ScalarEnum<T>,
    options: ScalarEnumCodecOptions<NumberDecoder> = {}
): Decoder<T> {
    const prefix = options.size ?? getU8Decoder();
    const { description, fixedSize, maxSize, minRange, maxRange, isNumericEnum, enumValues } = scalarEnumCoderHelper(
        constructor,
        prefix,
        options.description
    );
    return {
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('enum', bytes, offset);
            const [value, newOffset] = prefix.decode(bytes, offset);
            const valueAsNumber = Number(value);
            offset = newOffset;
            if (valueAsNumber < minRange || valueAsNumber > maxRange) {
                // TODO: Coded error.
                throw new Error(
                    `Enum discriminator out of range. ` +
                        `Expected a number between ${minRange} and ${maxRange}, got ${valueAsNumber}.`
                );
            }
            return [(isNumericEnum ? valueAsNumber : enumValues[valueAsNumber]) as T, offset];
        },
        description,
        fixedSize,
        maxSize,
    };
}

/**
 * Creates a scalar enum codec.
 *
 * @param constructor - The constructor of the scalar enum.
 * @param options - A set of options for the codec.
 */
export function getScalarEnumCodec<T>(
    constructor: ScalarEnum<T>,
    options: ScalarEnumCodecOptions<NumberCodec> = {}
): Codec<T> {
    return combineCodec(getScalarEnumEncoder(constructor, options), getScalarEnumDecoder(constructor, options));
}
