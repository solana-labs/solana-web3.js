import {
    assertByteArrayIsNotEmptyForCodec,
    BaseCodecOptions,
    Codec,
    CodecData,
    combineCodec,
    Decoder,
    Encoder,
    mergeBytes,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { maxCodecSizes, sumCodecSizes } from './utils';

/**
 * Defines a data enum using discriminated union types.
 *
 * @example
 * ```ts
 * type WebPageEvent =
 *   | { __kind: 'pageview', url: string }
 *   | { __kind: 'click', x: number, y: number };
 * ```
 */
export type DataEnum = { __kind: string };

/**
 * Extracts a variant from a data enum.
 *
 * @example
 * ```ts
 * type WebPageEvent =
 *   | { __kind: 'pageview', url: string }
 *   | { __kind: 'click', x: number, y: number };
 * type ClickEvent = GetDataEnumKind<WebPageEvent, 'click'>;
 * // -> { __kind: 'click', x: number, y: number }
 * ```
 */
export type GetDataEnumKind<T extends DataEnum, K extends T['__kind']> = Extract<T, { __kind: K }>;

/**
 * Extracts a variant from a data enum without its discriminator.
 *
 * @example
 * ```ts
 * type WebPageEvent =
 *   | { __kind: 'pageview', url: string }
 *   | { __kind: 'click', x: number, y: number };
 * type ClickEvent = GetDataEnumKindContent<WebPageEvent, 'click'>;
 * // -> { x: number, y: number }
 * ```
 */
export type GetDataEnumKindContent<T extends DataEnum, K extends T['__kind']> = Omit<
    Extract<T, { __kind: K }>,
    '__kind'
>;

/** Get the name and codec of each variant in a data enum. */
export type DataEnumToCodecTuple<T extends DataEnum, U extends T = T> = Array<
    T extends never
        ? never
        : [
              T['__kind'],
              keyof Omit<T, '__kind'> extends never
                  ? Codec<Omit<T, '__kind'>, Omit<U, '__kind'>> | Codec<void>
                  : Codec<Omit<T, '__kind'>, Omit<U, '__kind'>>
          ]
>;

/** Get the name and encoder of each variant in a data enum. */
export type DataEnumToEncoderTuple<T extends DataEnum> = Array<
    T extends never
        ? never
        : [
              T['__kind'],
              keyof Omit<T, '__kind'> extends never
                  ? Encoder<Omit<T, '__kind'>> | Encoder<void>
                  : Encoder<Omit<T, '__kind'>>
          ]
>;

/** Get the name and decoder of each variant in a data enum. */
export type DataEnumToDecoderTuple<T extends DataEnum> = Array<
    T extends never
        ? never
        : [
              T['__kind'],
              keyof Omit<T, '__kind'> extends never
                  ? Decoder<Omit<T, '__kind'>> | Decoder<void>
                  : Decoder<Omit<T, '__kind'>>
          ]
>;

/** Defines the options for data enum codecs. */
export type DataEnumCodecOptions<TDiscriminator = NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
    /**
     * The codec to use for the enum discriminator prefixing the variant.
     * @defaultValue u8 prefix.
     */
    size?: TDiscriminator;
};

function dataEnumCodecHelper(variants: Array<[string, CodecData]>, prefix: CodecData, description?: string): CodecData {
    const fieldDescriptions = variants
        .map(([name, codec]) => `${String(name)}${codec ? `: ${codec.description}` : ''}`)
        .join(', ');
    const allVariantHaveTheSameFixedSize = variants.every((one, _i, all) => one[1].fixedSize === all[0][1].fixedSize);
    const fixedVariantSize = allVariantHaveTheSameFixedSize ? variants[0][1].fixedSize : null;
    const maxVariantSize = maxCodecSizes(variants.map(([, field]) => field.maxSize));

    return {
        description: description ?? `dataEnum(${fieldDescriptions}; ${prefix.description})`,
        fixedSize: variants.length === 0 ? prefix.fixedSize : sumCodecSizes([prefix.fixedSize, fixedVariantSize]),
        maxSize: variants.length === 0 ? prefix.maxSize : sumCodecSizes([prefix.maxSize, maxVariantSize]),
    };
}

/**
 * Creates a data enum encoder.
 *
 * @param variants - The variant encoders of the data enum.
 * @param options - A set of options for the encoder.
 */
export function getDataEnumEncoder<T extends DataEnum>(
    variants: DataEnumToEncoderTuple<T>,
    options: DataEnumCodecOptions<NumberEncoder> = {}
): Encoder<T> {
    const prefix = options.size ?? getU8Encoder();
    return {
        ...dataEnumCodecHelper(variants, prefix, options.description),
        encode: (variant: T) => {
            const discriminator = variants.findIndex(([key]) => variant.__kind === key);
            if (discriminator < 0) {
                // TODO: Coded error.
                throw new Error(
                    `Invalid data enum variant. ` +
                        `Expected one of [${variants.map(([key]) => key).join(', ')}], ` +
                        `got "${variant.__kind}".`
                );
            }
            const variantPrefix = prefix.encode(discriminator);
            const variantSerializer = variants[discriminator][1];
            const variantBytes = variantSerializer.encode(variant as void & T);
            return mergeBytes([variantPrefix, variantBytes]);
        },
    };
}

/**
 * Creates a data enum decoder.
 *
 * @param variants - The variant decoders of the data enum.
 * @param options - A set of options for the decoder.
 */
export function getDataEnumDecoder<T extends DataEnum>(
    variants: DataEnumToDecoderTuple<T>,
    options: DataEnumCodecOptions<NumberDecoder> = {}
): Decoder<T> {
    const prefix = options.size ?? getU8Decoder();
    return {
        ...dataEnumCodecHelper(variants, prefix, options.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('dataEnum', bytes, offset);
            const [discriminator, dOffset] = prefix.decode(bytes, offset);
            offset = dOffset;
            const variantField = variants[Number(discriminator)] ?? null;
            if (!variantField) {
                // TODO: Coded error.
                throw new Error(
                    `Enum discriminator out of range. ` +
                        `Expected a number between 0 and ${variants.length - 1}, got ${discriminator}.`
                );
            }
            const [variant, vOffset] = variantField[1].decode(bytes, offset);
            offset = vOffset;
            return [{ __kind: variantField[0], ...(variant ?? {}) } as T, offset];
        },
    };
}

/**
 * Creates a data enum codec.
 *
 * @param variants - The variant codecs of the data enum.
 * @param options - A set of options for the codec.
 */
export function getDataEnumCodec<T extends DataEnum, U extends T = T>(
    variants: DataEnumToCodecTuple<T, U>,
    options: DataEnumCodecOptions<NumberCodec> = {}
): Codec<T, U> {
    return combineCodec(getDataEnumEncoder<T>(variants, options), getDataEnumDecoder<U>(variants, options));
}
