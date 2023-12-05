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

/** Get the name and encoder of each variant in a data enum. */
export type DataEnumToEncoderTuple<TFrom extends DataEnum> = Array<
    TFrom extends never
        ? never
        : [
              TFrom['__kind'],
              keyof Omit<TFrom, '__kind'> extends never
                  ? Encoder<Omit<TFrom, '__kind'>> | Encoder<void>
                  : Encoder<Omit<TFrom, '__kind'>>,
          ]
>;

/** Get the name and decoder of each variant in a data enum. */
export type DataEnumToDecoderTuple<TTo extends DataEnum> = Array<
    TTo extends never
        ? never
        : [
              TTo['__kind'],
              keyof Omit<TTo, '__kind'> extends never
                  ? Decoder<Omit<TTo, '__kind'>> | Decoder<void>
                  : Decoder<Omit<TTo, '__kind'>>,
          ]
>;

/** Get the name and codec of each variant in a data enum. */
export type DataEnumToCodecTuple<TFrom extends DataEnum, TTo extends TFrom = TFrom> = Array<
    TFrom extends never
        ? never
        : [
              TFrom['__kind'],
              keyof Omit<TFrom, '__kind'> extends never
                  ? Codec<Omit<TFrom, '__kind'>, Omit<TTo, '__kind'>> | Codec<void>
                  : Codec<Omit<TFrom, '__kind'>, Omit<TTo, '__kind'>>,
          ]
>;

/** Defines the config for data enum codecs. */
export type DataEnumCodecConfig<TDiscriminator = NumberCodec | NumberEncoder | NumberDecoder> = {
    /**
     * The codec to use for the enum discriminator prefixing the variant.
     * @defaultValue u8 prefix.
     */
    size?: TDiscriminator;
};

/**
 * Creates a data enum encoder.
 *
 * @param variants - The variant encoders of the data enum.
 * @param config - A set of config for the encoder.
 */
export function getDataEnumEncoder<TFrom extends DataEnum>(
    variants: DataEnumToEncoderTuple<TFrom>,
    config: DataEnumCodecConfig<NumberEncoder> = {},
): Encoder<TFrom> {
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
export function getDataEnumDecoder<T extends DataEnum>(
    variants: DataEnumToDecoderTuple<T>,
    config: DataEnumCodecConfig<NumberDecoder> = {},
): Decoder<T> {
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
                // TODO: Coded error.
                throw new Error(
                    `Enum discriminator out of range. ` +
                        `Expected a number between 0 and ${variants.length - 1}, got ${discriminator}.`,
                );
            }
            const [variant, vOffset] = variantField[1].read(bytes, offset);
            offset = vOffset;
            return [{ __kind: variantField[0], ...(variant ?? {}) } as T, offset];
        },
    });
}

/**
 * Creates a data enum codec.
 *
 * @param variants - The variant codecs of the data enum.
 * @param config - A set of config for the codec.
 */
export function getDataEnumCodec<T extends DataEnum, U extends T = T>(
    variants: DataEnumToCodecTuple<T, U>,
    config: DataEnumCodecConfig<NumberCodec> = {},
): Codec<T, U> {
    return combineCodec(getDataEnumEncoder<T>(variants, config), getDataEnumDecoder<U>(variants, config));
}

function getDataEnumFixedSize<T extends DataEnum>(
    variants: DataEnumToEncoderTuple<T> | DataEnumToDecoderTuple<T>,
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

function getDataEnumMaxSize<T extends DataEnum>(
    variants: DataEnumToEncoderTuple<T> | DataEnumToDecoderTuple<T>,
    prefix: { fixedSize: number } | object,
) {
    const maxVariantSize = maxCodecSizes(variants.map(([, codec]) => getMaxSize(codec)));
    return sumCodecSizes([getMaxSize(prefix), maxVariantSize]) ?? undefined;
}

function getVariantDiscriminator<TFrom extends DataEnum>(variants: DataEnumToEncoderTuple<TFrom>, variant: TFrom) {
    const discriminator = variants.findIndex(([key]) => variant.__kind === key);
    if (discriminator < 0) {
        // TODO: Coded error.
        throw new Error(
            `Invalid data enum variant. ` +
                `Expected one of [${variants.map(([key]) => key).join(', ')}], ` +
                `got "${variant.__kind}".`,
        );
    }
    return discriminator;
}
