/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    getEncodedSize,
    isFixedSize,
    Offset,
    ReadonlyUint8Array,
} from '@solana/codecs-core';
import { SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import { DrainOuterGeneric, getMaxSize, maxCodecSizes } from './utils';

type GetEncoderTypeFromVariants<TVariants extends readonly Encoder<any>[]> = DrainOuterGeneric<{
    [I in keyof TVariants]: TVariants[I] extends Encoder<infer TFrom> ? TFrom : never;
}>[number];

type GetDecoderTypeFromVariants<TVariants extends readonly Decoder<any>[]> = DrainOuterGeneric<{
    [I in keyof TVariants]: TVariants[I] extends Decoder<infer TFrom> ? TFrom : never;
}>[number];

/**
 * Creates a union encoder from the provided array of encoder.
 *
 * @param variants - The variant encoders of the union.
 * @param getIndexFromValue - A function that returns the index of the variant from the provided value.
 */
export function getUnionEncoder<const TVariants extends readonly Encoder<any>[]>(
    variants: TVariants,
    getIndexFromValue: (value: GetEncoderTypeFromVariants<TVariants>) => number,
): Encoder<GetEncoderTypeFromVariants<TVariants>> {
    type TFrom = GetEncoderTypeFromVariants<TVariants>;
    const fixedSize = getUnionFixedSize(variants);
    const write: Encoder<TFrom>['write'] = (variant, bytes, offset) => {
        const index = getIndexFromValue(variant);
        assertValidVariantIndex(variants, index);
        return variants[index].write(variant, bytes, offset);
    };

    if (fixedSize !== null) {
        return createEncoder({ fixedSize, write });
    }

    const maxSize = getUnionMaxSize(variants);
    return createEncoder({
        ...(maxSize !== null ? { maxSize } : {}),
        getSizeFromValue: variant => {
            const index = getIndexFromValue(variant);
            assertValidVariantIndex(variants, index);
            return getEncodedSize(variant, variants[index]);
        },
        write,
    });
}

/**
 * Creates a union decoder from the provided array of decoder.
 *
 * @param variants - The variant decoders of the union.
 * @param getIndexFromBytes - A function that returns the index of the variant from the byte array.
 */
export function getUnionDecoder<const TVariants extends readonly Decoder<any>[]>(
    variants: TVariants,
    getIndexFromBytes: (bytes: ReadonlyUint8Array, offset: Offset) => number,
): Decoder<GetDecoderTypeFromVariants<TVariants>> {
    type TTo = GetDecoderTypeFromVariants<TVariants>;
    const fixedSize = getUnionFixedSize(variants);
    const read: Decoder<TTo>['read'] = (bytes, offset) => {
        const index = getIndexFromBytes(bytes, offset);
        assertValidVariantIndex(variants, index);
        return variants[index].read(bytes, offset);
    };

    if (fixedSize !== null) {
        return createDecoder({ fixedSize, read });
    }

    const maxSize = getUnionMaxSize(variants);
    return createDecoder({ ...(maxSize !== null ? { maxSize } : {}), read });
}

/**
 * Creates a union codec from the provided array of codec.
 *
 * @param variants - The variant codecs of the union.
 * @param getIndexFromValue - A function that returns the index of the variant from the provided value.
 * @param getIndexFromBytes - A function that returns the index of the variant from the byte array.
 */
export function getUnionCodec<const TVariants extends readonly Codec<any>[]>(
    variants: TVariants,
    getIndexFromValue: (value: GetEncoderTypeFromVariants<TVariants>) => number,
    getIndexFromBytes: (bytes: ReadonlyUint8Array, offset: Offset) => number,
): Codec<
    GetEncoderTypeFromVariants<TVariants>,
    GetDecoderTypeFromVariants<TVariants> & GetEncoderTypeFromVariants<TVariants>
> {
    return combineCodec(
        getUnionEncoder(variants, getIndexFromValue),
        getUnionDecoder(variants, getIndexFromBytes) as Decoder<
            GetDecoderTypeFromVariants<TVariants> & GetEncoderTypeFromVariants<TVariants>
        >,
    );
}

function assertValidVariantIndex(variants: readonly unknown[], index: number) {
    if (typeof variants[index] === 'undefined') {
        throw new SolanaError(SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, {
            maxRange: variants.length - 1,
            minRange: 0,
            variant: index,
        });
    }
}

function getUnionFixedSize<const TVariants extends readonly (Decoder<any> | Encoder<any>)[]>(variants: TVariants) {
    if (variants.length === 0) return 0;
    if (!isFixedSize(variants[0])) return null;
    const variantSize = variants[0].fixedSize;
    const sameSizedVariants = variants.every(variant => isFixedSize(variant) && variant.fixedSize === variantSize);
    return sameSizedVariants ? variantSize : null;
}

function getUnionMaxSize<const TVariants extends readonly (Decoder<any> | Encoder<any>)[]>(variants: TVariants) {
    return maxCodecSizes(variants.map(variant => getMaxSize(variant)));
}
