import { BaseCodecConfig, Codec, CodecData, combineCodec, Decoder, Encoder, mergeBytes } from '@solana/codecs-core';
import { getU32Decoder, getU32Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import {
    ArrayLikeCodecSize,
    decodeArrayLikeCodecSize,
    getArrayLikeCodecSizeDescription,
    getArrayLikeCodecSizeFromChildren,
    getArrayLikeCodecSizePrefix,
} from './array-like-codec-size';
import { assertValidNumberOfItemsForCodec } from './assertions';

/** Defines the configs for array codecs. */
export type ArrayCodecConfig<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecConfig & {
    /**
     * The size of the array.
     * @defaultValue u32 prefix.
     */
    size?: ArrayLikeCodecSize<TPrefix>;
};

function arrayCodecHelper(item: CodecData, size: ArrayLikeCodecSize<CodecData>, description?: string): CodecData {
    if (size === 'remainder' && item.fixedSize === null) {
        // TODO: Coded error.
        throw new Error('Codecs of "remainder" size must have fixed-size items.');
    }

    return {
        description: description ?? `array(${item.description}; ${getArrayLikeCodecSizeDescription(size)})`,
        fixedSize: getArrayLikeCodecSizeFromChildren(size, [item.fixedSize]),
        maxSize: getArrayLikeCodecSizeFromChildren(size, [item.maxSize]),
    };
}

/**
 * Encodes an array of items.
 *
 * @param item - The encoder to use for the array's items.
 * @param config - A set of config for the encoder.
 */
export function getArrayEncoder<T>(item: Encoder<T>, config: ArrayCodecConfig<NumberEncoder> = {}): Encoder<T[]> {
    const size = config.size ?? getU32Encoder();
    return {
        ...arrayCodecHelper(item, size, config.description),
        encode: (value: T[]) => {
            if (typeof size === 'number') {
                assertValidNumberOfItemsForCodec('array', size, value.length);
            }
            return mergeBytes([getArrayLikeCodecSizePrefix(size, value.length), ...value.map(v => item.encode(v))]);
        },
    };
}

/**
 * Decodes an array of items.
 *
 * @param item - The encoder to use for the array's items.
 * @param config - A set of config for the encoder.
 */
export function getArrayDecoder<T>(item: Decoder<T>, config: ArrayCodecConfig<NumberDecoder> = {}): Decoder<T[]> {
    const size = config.size ?? getU32Decoder();
    return {
        ...arrayCodecHelper(item, size, config.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            if (typeof size === 'object' && bytes.slice(offset).length === 0) {
                return [[], offset];
            }
            const [resolvedSize, newOffset] = decodeArrayLikeCodecSize(size, [item.fixedSize], bytes, offset);
            offset = newOffset;
            const values: T[] = [];
            for (let i = 0; i < resolvedSize; i += 1) {
                const [value, newOffset] = item.decode(bytes, offset);
                values.push(value);
                offset = newOffset;
            }
            return [values, offset];
        },
    };
}

/**
 * Creates a codec for an array of items.
 *
 * @param item - The codec to use for the array's items.
 * @param config - A set of config for the codec.
 */
export function getArrayCodec<T, U extends T = T>(
    item: Codec<T, U>,
    config: ArrayCodecConfig<NumberCodec> = {},
): Codec<T[], U[]> {
    return combineCodec(getArrayEncoder(item, config), getArrayDecoder(item, config));
}
