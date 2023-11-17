import { BaseCodecConfig, Codec, CodecData, combineCodec, Decoder, Encoder, mergeBytes } from '@solana/codecs-core';

import { assertValidNumberOfItemsForCodec } from './assertions';
import { sumCodecSizes } from './utils';

/** Defines the config for tuple codecs. */
export type TupleCodecConfig = BaseCodecConfig;

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
 * @param config - A set of config for the encoder.
 */
export function getTupleEncoder<T extends AnyArray>(
    items: WrapInEncoder<[...T]>,
    config: TupleCodecConfig = {}
): Encoder<T> {
    return {
        ...tupleCodecHelper(items, config.description),
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
 * @param config - A set of config for the decoder.
 */
export function getTupleDecoder<T extends AnyArray>(
    items: WrapInDecoder<[...T]>,
    config: TupleCodecConfig = {}
): Decoder<T> {
    return {
        ...tupleCodecHelper(items, config.description),
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
 * @param config - A set of config for the codec.
 */
export function getTupleCodec<T extends AnyArray, U extends T = T>(
    items: WrapInCodec<[...T], [...U]>,
    config: TupleCodecConfig = {}
): Codec<T, U> {
    return combineCodec(
        getTupleEncoder(items as WrapInEncoder<[...T]>, config),
        getTupleDecoder(items as WrapInDecoder<[...U]>, config)
    );
}
