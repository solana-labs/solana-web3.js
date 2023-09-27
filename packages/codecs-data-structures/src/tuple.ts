import { BaseCodecOptions, Codec, CodecData, combineCodec, Decoder, Encoder, mergeBytes } from '@solana/codecs-core';

import { assertValidNumberOfItemsForCodec } from './assertions';
import { sumCodecSizes } from './utils';

/** Defines the options for tuple codecs. */
export type TupleCodecOptions = BaseCodecOptions;

type WrapInEncoder<T> = {
    [P in keyof T]: Encoder<T[P]>;
};
type WrapInDecoder<T> = {
    [P in keyof T]: Decoder<T[P]>;
};
type WrapInCodec<T, U extends T = T> = {
    [P in keyof T]: Codec<T[P], U[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArray = any[];

function tupleCodecHelper(items: Array<CodecData>, description?: string): CodecData {
    const itemDescriptions = items.map(item => item.description).join(', ');

    return {
        description: description ?? `tuple(${itemDescriptions})`,
        fixedSize: sumCodecSizes(items.map(item => item.fixedSize)),
        maxSize: sumCodecSizes(items.map(item => item.maxSize)),
    };
}

/**
 * Creates a encoder for a tuple-like array.
 *
 * @param items - The encoders to use for each item in the tuple.
 * @param options - A set of options for the encoder.
 */
export function getTupleEncoder<T extends AnyArray>(
    items: WrapInEncoder<[...T]>,
    options: TupleCodecOptions = {}
): Encoder<T> {
    return {
        ...tupleCodecHelper(items, options.description),
        encode: (value: T) => {
            assertValidNumberOfItemsForCodec('tuple', items.length, value.length);
            return mergeBytes(items.map((item, index) => item.encode(value[index])));
        },
    };
}

/**
 * Creates a decoder for a tuple-like array.
 *
 * @param items - The decoders to use for each item in the tuple.
 * @param options - A set of options for the decoder.
 */
export function getTupleDecoder<T extends AnyArray>(
    items: WrapInDecoder<[...T]>,
    options: TupleCodecOptions = {}
): Decoder<T> {
    return {
        ...tupleCodecHelper(items, options.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            const values = [] as AnyArray as T;
            items.forEach(codec => {
                const [newValue, newOffset] = codec.decode(bytes, offset);
                values.push(newValue);
                offset = newOffset;
            });
            return [values, offset];
        },
    };
}

/**
 * Creates a codec for a tuple-like array.
 *
 * @param items - The codecs to use for each item in the tuple.
 * @param options - A set of options for the codec.
 */
export function getTupleCodec<T extends AnyArray, U extends T = T>(
    items: WrapInCodec<[...T], [...U]>,
    options: TupleCodecOptions = {}
): Codec<T, U> {
    return combineCodec(
        getTupleEncoder(items as WrapInEncoder<[...T]>, options),
        getTupleDecoder(items as WrapInDecoder<[...U]>, options)
    );
}
