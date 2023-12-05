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
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { assertValidNumberOfItemsForCodec } from './assertions';
import { getFixedSize, getMaxSize, sumCodecSizes } from './utils';

type WrapInFixedSizeEncoder<TFrom> = {
    [P in keyof TFrom]: FixedSizeEncoder<TFrom[P]>;
};
type WrapInEncoder<TFrom> = {
    [P in keyof TFrom]: Encoder<TFrom[P]>;
};
type WrapInFixedSizeDecoder<TTo> = {
    [P in keyof TTo]: FixedSizeDecoder<TTo[P]>;
};
type WrapInDecoder<TTo> = {
    [P in keyof TTo]: Decoder<TTo[P]>;
};
type WrapInCodec<TFrom, TTo extends TFrom> = {
    [P in keyof TFrom]: Codec<TFrom[P], TTo[P]>;
};
type WrapInFixedSizeCodec<TFrom, TTo extends TFrom> = {
    [P in keyof TFrom]: FixedSizeCodec<TFrom[P], TTo[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArray = any[];

/**
 * Creates a encoder for a tuple-like array.
 *
 * @param items - The encoders to use for each item in the tuple.
 */
export function getTupleEncoder<TFrom extends AnyArray>(
    items: WrapInFixedSizeEncoder<[...TFrom]>,
): FixedSizeEncoder<TFrom>;
export function getTupleEncoder<TFrom extends AnyArray>(items: WrapInEncoder<[...TFrom]>): VariableSizeEncoder<TFrom>;
export function getTupleEncoder<TFrom extends AnyArray>(items: WrapInEncoder<[...TFrom]>): Encoder<TFrom> {
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
export function getTupleDecoder<TTo extends AnyArray>(items: WrapInFixedSizeDecoder<[...TTo]>): FixedSizeDecoder<TTo>;
export function getTupleDecoder<TTo extends AnyArray>(items: WrapInDecoder<[...TTo]>): VariableSizeDecoder<TTo>;
export function getTupleDecoder<TTo extends AnyArray>(items: WrapInDecoder<[...TTo]>): Decoder<TTo> {
    const fixedSize = sumCodecSizes(items.map(getFixedSize));
    const maxSize = sumCodecSizes(items.map(getMaxSize)) ?? undefined;

    return createDecoder({
        ...(fixedSize === null ? { maxSize } : { fixedSize }),
        read: (bytes: Uint8Array, offset) => {
            const values = [] as AnyArray as TTo;
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
export function getTupleCodec<TFrom extends AnyArray, TTo extends TFrom = TFrom>(
    items: WrapInFixedSizeCodec<[...TFrom], [...TTo]>,
): FixedSizeCodec<TFrom, TTo>;
export function getTupleCodec<TFrom extends AnyArray, TTo extends TFrom = TFrom>(
    items: WrapInCodec<[...TFrom], [...TTo]>,
): VariableSizeCodec<TFrom, TTo>;
export function getTupleCodec<TFrom extends AnyArray, TTo extends TFrom = TFrom>(
    items: WrapInCodec<[...TFrom], [...TTo]>,
): Codec<TFrom, TTo> {
    return combineCodec(
        getTupleEncoder(items as WrapInEncoder<[...TFrom]>),
        getTupleDecoder(items as WrapInDecoder<[...TTo]>),
    );
}
