import { BaseCodecOptions, Codec, CodecData, combineCodec, Decoder, Encoder, mergeBytes } from '@solana/codecs-core';
import { getU32Decoder, getU32Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import {
    ArrayLikeCodecSize,
    decodeArrayLikeCodecSize,
    getArrayLikeCodecSizeDescription,
    getArrayLikeCodecSizeFromChildren,
    getArrayLikeCodecSizePrefix,
} from './array-like-codec-size';
import { assertValidNumberOfItemsForCodec } from './assertions';

/** Defines the options for set codecs. */
export type SetCodecOptions<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
    /**
     * The size of the set.
     * @defaultValue u32 prefix.
     */
    size?: ArrayLikeCodecSize<TPrefix>;
};

function setCodecHelper(item: CodecData, size: ArrayLikeCodecSize<CodecData>, description?: string): CodecData {
    if (size === 'remainder' && item.fixedSize === null) {
        // TODO: Coded error.
        throw new Error('Codecs of "remainder" size must have fixed-size items.');
    }

    return {
        description: description ?? `set(${item.description}; ${getArrayLikeCodecSizeDescription(size)})`,
        fixedSize: getArrayLikeCodecSizeFromChildren(size, [item.fixedSize]),
        maxSize: getArrayLikeCodecSizeFromChildren(size, [item.maxSize]),
    };
}

/**
 * Encodes an set of items.
 *
 * @param item - The encoder to use for the set's items.
 * @param options - A set of options for the encoder.
 */
export function getSetEncoder<T>(item: Encoder<T>, options: SetCodecOptions<NumberEncoder> = {}): Encoder<Set<T>> {
    const size = options.size ?? getU32Encoder();
    return {
        ...setCodecHelper(item, size, options.description),
        encode: (set: Set<T>) => {
            if (typeof size === 'number' && set.size !== size) {
                assertValidNumberOfItemsForCodec('set', size, set.size);
            }
            const itemBytes = Array.from(set, value => item.encode(value));
            return mergeBytes([getArrayLikeCodecSizePrefix(size, set.size), ...itemBytes]);
        },
    };
}

/**
 * Decodes an set of items.
 *
 * @param item - The encoder to use for the set's items.
 * @param options - A set of options for the encoder.
 */
export function getSetDecoder<T>(item: Decoder<T>, options: SetCodecOptions<NumberDecoder> = {}): Decoder<Set<T>> {
    const size = options.size ?? getU32Decoder();
    return {
        ...setCodecHelper(item, size, options.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            const set: Set<T> = new Set();
            if (typeof size === 'object' && bytes.slice(offset).length === 0) {
                return [set, offset];
            }
            const [resolvedSize, newOffset] = decodeArrayLikeCodecSize(size, [item.fixedSize], bytes, offset);
            offset = newOffset;
            for (let i = 0; i < resolvedSize; i += 1) {
                const [value, newOffset] = item.decode(bytes, offset);
                offset = newOffset;
                set.add(value);
            }
            return [set, offset];
        },
    };
}

/**
 * Creates a codec for an set of items.
 *
 * @param item - The codec to use for the set's items.
 * @param options - A set of options for the codec.
 */
export function getSetCodec<T, U extends T = T>(
    item: Codec<T, U>,
    options: SetCodecOptions<NumberCodec> = {}
): Codec<Set<T>, Set<U>> {
    return combineCodec(getSetEncoder(item, options), getSetDecoder(item, options));
}
