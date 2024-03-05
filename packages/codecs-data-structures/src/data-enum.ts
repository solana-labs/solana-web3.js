/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    assertByteArrayIsNotEmptyForCodec,
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    getEncodedSize,
    isFixedSize,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';
import {
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_DATA_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import { getMaxSize, maxCodecSizes, sumCodecSizes } from './utils';

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

/** Defines the config for data enum codecs. */
export type DataEnumCodecConfig<TDiscriminator = NumberCodec | NumberEncoder | NumberDecoder> = {
    /**
     * The codec to use for the enum discriminator prefixing the variant.
     * @defaultValue u8 prefix.
     */
    size?: TDiscriminator;
};

type Variants<T> = readonly (readonly [string, T])[];
type ArrayIndices<T extends readonly unknown[]> = Exclude<Partial<T>['length'], T['length']> & number;

type GetEncoderTypeFromVariants<TVariants extends Variants<Encoder<any>>> = {
    [I in ArrayIndices<TVariants>]: { __kind: TVariants[I][0] } & (TVariants[I][1] extends Encoder<infer TFrom>
        ? TFrom extends object
            ? TFrom
            : object
        : never);
}[ArrayIndices<TVariants>];

type GetDecoderTypeFromVariants<TVariants extends Variants<Decoder<any>>> = {
    [I in ArrayIndices<TVariants>]: { __kind: TVariants[I][0] } & (TVariants[I][1] extends Decoder<infer TTo>
        ? TTo extends object
            ? TTo
            : object
        : never);
}[ArrayIndices<TVariants>];

/**
 * Creates a data enum encoder.
 *
 * @param variants - The variant encoders of the data enum.
 * @param config - A set of config for the encoder.
 */
export function getDataEnumEncoder<const TVariants extends Variants<Encoder<any>>>(
    variants: TVariants,
    config: DataEnumCodecConfig<NumberEncoder> = {},
): Encoder<GetEncoderTypeFromVariants<TVariants>> {
    type TFrom = GetEncoderTypeFromVariants<TVariants>;
    const prefix = config.size ?? getU8Encoder();
    const fixedSize = getDataEnumFixedSize(variants, prefix);
    return createEncoder({
        ...(fixedSize !== null
            ? { fixedSize }
            : {
                  getSizeFromValue: (variant: TFrom) => {
                      const discriminator = getVariantDiscriminator(variants, variant);
                      const variantEncoder = variants[discriminator][1];
                      return (
                          getEncodedSize(discriminator, prefix) +
                          getEncodedSize(variant as void & TFrom, variantEncoder)
                      );
                  },
                  maxSize: getDataEnumMaxSize(variants, prefix),
              }),
        write: (variant: TFrom, bytes, offset) => {
            const discriminator = getVariantDiscriminator(variants, variant);
            offset = prefix.write(discriminator, bytes, offset);
            const variantEncoder = variants[discriminator][1];
            return variantEncoder.write(variant as void & TFrom, bytes, offset);
        },
    });
}

/**
 * Creates a data enum decoder.
 *
 * @param variants - The variant decoders of the data enum.
 * @param config - A set of config for the decoder.
 */
export function getDataEnumDecoder<const TVariants extends Variants<Decoder<any>>>(
    variants: TVariants,
    config: DataEnumCodecConfig<NumberDecoder> = {},
): Decoder<GetDecoderTypeFromVariants<TVariants>> {
    type TTo = GetDecoderTypeFromVariants<TVariants>;
    const prefix = config.size ?? getU8Decoder();
    const fixedSize = getDataEnumFixedSize(variants, prefix);
    return createDecoder({
        ...(fixedSize !== null ? { fixedSize } : { maxSize: getDataEnumMaxSize(variants, prefix) }),
        read: (bytes: Uint8Array, offset) => {
            assertByteArrayIsNotEmptyForCodec('dataEnum', bytes, offset);
            const [discriminator, dOffset] = prefix.read(bytes, offset);
            offset = dOffset;
            const variantField = variants[Number(discriminator)] ?? null;
            if (!variantField) {
                throw new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator,
                    maxRange: variants.length - 1,
                    minRange: 0,
                });
            }
            const [variant, vOffset] = variantField[1].read(bytes, offset);
            offset = vOffset;
            return [{ __kind: variantField[0], ...(variant ?? {}) } as TTo, offset];
        },
    });
}

/**
 * Creates a data enum codec.
 *
 * @param variants - The variant codecs of the data enum.
 * @param config - A set of config for the codec.
 */
export function getDataEnumCodec<const TVariants extends Variants<Codec<any, any>>>(
    variants: TVariants,
    config: DataEnumCodecConfig<NumberCodec> = {},
): Codec<
    GetEncoderTypeFromVariants<TVariants>,
    GetDecoderTypeFromVariants<TVariants> & GetEncoderTypeFromVariants<TVariants>
> {
    return combineCodec(
        getDataEnumEncoder(variants, config),
        getDataEnumDecoder(variants, config) as Decoder<
            GetDecoderTypeFromVariants<TVariants> & GetEncoderTypeFromVariants<TVariants>
        >,
    );
}

function getDataEnumFixedSize<const TVariants extends Variants<Encoder<any> | Decoder<any>>>(
    variants: TVariants,
    prefix: { fixedSize: number } | object,
): number | null {
    if (variants.length === 0) return isFixedSize(prefix) ? prefix.fixedSize : null;
    if (!isFixedSize(variants[0][1])) return null;
    const variantSize = variants[0][1].fixedSize;
    const sameSizedVariants = variants.every(
        variant => isFixedSize(variant[1]) && variant[1].fixedSize === variantSize,
    );
    if (!sameSizedVariants) return null;
    return isFixedSize(prefix) ? prefix.fixedSize + variantSize : null;
}

function getDataEnumMaxSize<const TVariants extends Variants<Encoder<any> | Decoder<any>>>(
    variants: TVariants,
    prefix: { fixedSize: number } | object,
) {
    const maxVariantSize = maxCodecSizes(variants.map(([, codec]) => getMaxSize(codec)));
    return sumCodecSizes([getMaxSize(prefix), maxVariantSize]) ?? undefined;
}

function getVariantDiscriminator<const TVariants extends Variants<Encoder<any> | Decoder<any>>>(
    variants: TVariants,
    variant: { __kind: string },
) {
    const discriminator = variants.findIndex(([key]) => variant.__kind === key);
    if (discriminator < 0) {
        throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_DATA_ENUM_VARIANT, {
            value: variant.__kind,
            variants: variants.map(([key]) => key),
        });
    }
    return discriminator;
}
