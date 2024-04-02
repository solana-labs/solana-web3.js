/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    getEncodedSize,
    ReadonlyUint8Array,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { assertValidNumberOfItemsForCodec } from './assertions';
import { DrainOuterGeneric, getFixedSize, getMaxSize, sumCodecSizes } from './utils';

type GetEncoderTypeFromItems<TItems extends readonly Encoder<any>[]> = DrainOuterGeneric<{
    [I in keyof TItems]: TItems[I] extends Encoder<infer TFrom> ? TFrom : never;
}>;

type GetDecoderTypeFromItems<TItems extends readonly Decoder<any>[]> = DrainOuterGeneric<{
    [I in keyof TItems]: TItems[I] extends Decoder<infer TTo> ? TTo : never;
}>;

/**
 * Creates a encoder for a tuple-like array.
 *
 * @param items - The encoders to use for each item in the tuple.
 */
export function getTupleEncoder<const TItems extends readonly FixedSizeEncoder<any>[]>(
    items: TItems,
): FixedSizeEncoder<GetEncoderTypeFromItems<TItems>>;
export function getTupleEncoder<const TItems extends readonly Encoder<any>[]>(
    items: TItems,
): VariableSizeEncoder<GetEncoderTypeFromItems<TItems>>;
export function getTupleEncoder<const TItems extends readonly Encoder<any>[]>(
    items: TItems,
): Encoder<GetEncoderTypeFromItems<TItems>> {
    type TFrom = GetEncoderTypeFromItems<TItems>;
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? undefined;

    return createEncoder({
        ...(fixedSize === null
            ? {
                  getSizeFromValue: (value: TFrom) =>
                      items.map((item, index) => getEncodedSize(value[index], item)).reduce((all, one) => all + one, 0),
                  maxSize,
              }
            : { fixedSize }),
        write: (value: TFrom, bytes, offset) => {
            assertValidNumberOfItemsForCodec('tuple', items.length, value.length);
            items.forEach((item, index) => {
                offset = item.write(value[index], bytes, offset);
            });
            return offset;
        },
    });
}

/**
 * Creates a decoder for a tuple-like array.
 *
 * @param items - The decoders to use for each item in the tuple.
 */

export function getTupleDecoder<const TItems extends readonly FixedSizeDecoder<any>[]>(
    items: TItems,
): FixedSizeDecoder<GetDecoderTypeFromItems<TItems>>;
export function getTupleDecoder<const TItems extends readonly Decoder<any>[]>(
    items: TItems,
): VariableSizeDecoder<GetDecoderTypeFromItems<TItems>>;
export function getTupleDecoder<const TItems extends readonly Decoder<any>[]>(
    items: TItems,
): Decoder<GetDecoderTypeFromItems<TItems>> {
    type TTo = GetDecoderTypeFromItems<TItems>;
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? undefined;

    return createDecoder({
        ...(fixedSize === null ? { maxSize } : { fixedSize }),
        read: (bytes: ReadonlyUint8Array | Uint8Array, offset) => {
            const values = [] as Array<any> & TTo;
            items.forEach(item => {
                const [newValue, newOffset] = item.read(bytes, offset);
                values.push(newValue);
                offset = newOffset;
            });
            return [values, offset];
        },
    });
}

/**
 * Creates a codec for a tuple-like array.
 *
 * @param items - The codecs to use for each item in the tuple.
 */
export function getTupleCodec<const TItems extends readonly FixedSizeCodec<any>[]>(
    items: TItems,
): FixedSizeCodec<GetEncoderTypeFromItems<TItems>, GetDecoderTypeFromItems<TItems> & GetEncoderTypeFromItems<TItems>>;
export function getTupleCodec<const TItems extends readonly Codec<any>[]>(
    items: TItems,
): VariableSizeCodec<
    GetEncoderTypeFromItems<TItems>,
    GetDecoderTypeFromItems<TItems> & GetEncoderTypeFromItems<TItems>
>;
export function getTupleCodec<const TItems extends readonly Codec<any>[]>(
    items: TItems,
): Codec<GetEncoderTypeFromItems<TItems>, GetDecoderTypeFromItems<TItems> & GetEncoderTypeFromItems<TItems>> {
    return combineCodec(
        getTupleEncoder(items),
        getTupleDecoder(items) as Decoder<GetDecoderTypeFromItems<TItems> & GetEncoderTypeFromItems<TItems>>,
    );
}
