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

import { DrainOuterGeneric, getMaxSize, maxCodecSizes, sumCodecSizes } from './utils';

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
export type DataEnum<TDiscriminatorProperty extends string = '__kind', TDiscriminatorValue extends string = string> = {
    [P in TDiscriminatorProperty]: TDiscriminatorValue;
};

/**
 * Extracts a variant from a data enum.
 *
 * @example
 * ```ts
 * type WebPageEvent =
 *   | { __kind: 'pageview', url: string }
 *   | { __kind: 'click', x: number, y: number };
 * type ClickEvent = GetDataEnumKind<WebPageEvent, '__kind', 'click'>;
 * // -> { __kind: 'click', x: number, y: number }
 * ```
 */
export type GetDataEnumKind<
    TDataEnum extends DataEnum<TDiscriminatorProperty>,
    TDiscriminatorProperty extends string,
    TDiscriminatorValue extends TDataEnum[TDiscriminatorProperty],
> = Extract<TDataEnum, DataEnum<TDiscriminatorProperty, TDiscriminatorValue>>;

/**
 * Extracts a variant from a data enum without its discriminator.
 *
 * @example
 * ```ts
 * type WebPageEvent =
 *   | { __kind: 'pageview', url: string }
 *   | { __kind: 'click', x: number, y: number };
 * type ClickEvent = GetDataEnumKindContent<WebPageEvent, '__kind', 'click'>;
 * // -> { x: number, y: number }
 * ```
 */
export type GetDataEnumKindContent<
    TDataEnum extends DataEnum<TDiscriminatorProperty>,
    TDiscriminatorProperty extends string,
    TDiscriminatorValue extends TDataEnum[TDiscriminatorProperty],
> = Omit<GetDataEnumKind<TDataEnum, TDiscriminatorProperty, TDiscriminatorValue>, TDiscriminatorProperty>;

/** Defines the config for data enum codecs. */
export type DataEnumCodecConfig<
    TDiscriminatorProperty extends string = '__kind',
    TDiscriminatorSize = NumberCodec | NumberDecoder | NumberEncoder,
> = {
    /**
     * The property name of the discriminator.
     * @defaultValue `__kind`.
     */
    discriminator?: TDiscriminatorProperty;
    /**
     * The codec to use for the enum discriminator prefixing the variant.
     * @defaultValue u8 prefix.
     */
    size?: TDiscriminatorSize;
};

type DiscriminatorValue = number | string | symbol;
type Variants<T> = readonly (readonly [DiscriminatorValue, T])[];
type ArrayIndices<T extends readonly unknown[]> = Exclude<Partial<T>['length'], T['length']> & number;

type GetEncoderTypeFromVariants<
    TVariants extends Variants<Encoder<any>>,
    TDiscriminatorProperty extends string,
> = DrainOuterGeneric<{
    [I in ArrayIndices<TVariants>]: (TVariants[I][1] extends Encoder<infer TFrom>
        ? TFrom extends object
            ? TFrom
            : object
        : never) & { [P in TDiscriminatorProperty]: TVariants[I][0] };
}>[ArrayIndices<TVariants>];

type GetDecoderTypeFromVariants<
    TVariants extends Variants<Decoder<any>>,
    TDiscriminatorProperty extends string,
> = DrainOuterGeneric<{
    [I in ArrayIndices<TVariants>]: (TVariants[I][1] extends Decoder<infer TTo>
        ? TTo extends object
            ? TTo
            : object
        : never) & { [P in TDiscriminatorProperty]: TVariants[I][0] };
}>[ArrayIndices<TVariants>];

/**
 * Creates a data enum encoder.
 *
 * @param variants - The variant encoders of the data enum.
 * @param config - A set of config for the encoder.
 */
export function getDataEnumEncoder<
    const TVariants extends Variants<Encoder<any>>,
    const TDiscriminatorProperty extends string = '__kind',
>(
    variants: TVariants,
    config: DataEnumCodecConfig<TDiscriminatorProperty, NumberEncoder> = {},
): Encoder<GetEncoderTypeFromVariants<TVariants, TDiscriminatorProperty>> {
    type TFrom = GetEncoderTypeFromVariants<TVariants, TDiscriminatorProperty>;
    const discriminatorProperty = (config.discriminator ?? '__kind') as TDiscriminatorProperty;
    const prefix = config.size ?? getU8Encoder();
    const fixedSize = getDataEnumFixedSize(variants, prefix);
    return createEncoder({
        ...(fixedSize !== null
            ? { fixedSize }
            : {
                  getSizeFromValue: (variant: TFrom) => {
                      const discriminator = getVariantDiscriminator(variants, variant[discriminatorProperty]);
                      const variantEncoder = variants[discriminator][1];
                      return (
                          getEncodedSize(discriminator, prefix) +
                          getEncodedSize(variant as TFrom & void, variantEncoder)
                      );
                  },
                  maxSize: getDataEnumMaxSize(variants, prefix),
              }),
        write: (variant: TFrom, bytes, offset) => {
            const discriminator = getVariantDiscriminator(variants, variant[discriminatorProperty]);
            offset = prefix.write(discriminator, bytes, offset);
            const variantEncoder = variants[discriminator][1];
            return variantEncoder.write(variant as TFrom & void, bytes, offset);
        },
    });
}

/**
 * Creates a data enum decoder.
 *
 * @param variants - The variant decoders of the data enum.
 * @param config - A set of config for the decoder.
 */
export function getDataEnumDecoder<
    const TVariants extends Variants<Decoder<any>>,
    const TDiscriminatorProperty extends string = '__kind',
>(
    variants: TVariants,
    config: DataEnumCodecConfig<TDiscriminatorProperty, NumberDecoder> = {},
): Decoder<GetDecoderTypeFromVariants<TVariants, TDiscriminatorProperty>> {
    type TTo = GetDecoderTypeFromVariants<TVariants, TDiscriminatorProperty>;
    const discriminatorProperty = config.discriminator ?? '__kind';
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
            return [{ [discriminatorProperty]: variantField[0], ...(variant ?? {}) } as TTo, offset];
        },
    });
}

/**
 * Creates a data enum codec.
 *
 * @param variants - The variant codecs of the data enum.
 * @param config - A set of config for the codec.
 */
export function getDataEnumCodec<
    const TVariants extends Variants<Codec<any, any>>,
    const TDiscriminatorProperty extends string = '__kind',
>(
    variants: TVariants,
    config: DataEnumCodecConfig<TDiscriminatorProperty, NumberCodec> = {},
): Codec<
    GetEncoderTypeFromVariants<TVariants, TDiscriminatorProperty>,
    GetDecoderTypeFromVariants<TVariants, TDiscriminatorProperty> &
        GetEncoderTypeFromVariants<TVariants, TDiscriminatorProperty>
> {
    return combineCodec(
        getDataEnumEncoder(variants, config),
        getDataEnumDecoder(variants, config) as Decoder<
            GetDecoderTypeFromVariants<TVariants, TDiscriminatorProperty> &
                GetEncoderTypeFromVariants<TVariants, TDiscriminatorProperty>
        >,
    );
}

function getDataEnumFixedSize<const TVariants extends Variants<Decoder<any> | Encoder<any>>>(
    variants: TVariants,
    prefix: object | { fixedSize: number },
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

function getDataEnumMaxSize<const TVariants extends Variants<Decoder<any> | Encoder<any>>>(
    variants: TVariants,
    prefix: object | { fixedSize: number },
) {
    const maxVariantSize = maxCodecSizes(variants.map(([, codec]) => getMaxSize(codec)));
    return sumCodecSizes([getMaxSize(prefix), maxVariantSize]) ?? undefined;
}

function getVariantDiscriminator<const TVariants extends Variants<Decoder<any> | Encoder<any>>>(
    variants: TVariants,
    discriminatorValue: DiscriminatorValue,
) {
    const discriminator = variants.findIndex(([key]) => discriminatorValue === key);
    if (discriminator < 0) {
        throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_DATA_ENUM_VARIANT, {
            value: discriminatorValue,
            variants: variants.map(([key]) => key),
        });
    }
    return discriminator;
}
