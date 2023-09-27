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

/** Defines the options for Map codecs. */
export type MapCodecOptions<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
    /**
     * The size of the array.
     * @defaultValue u32 prefix.
     */
    size?: ArrayLikeCodecSize<TPrefix>;
};

function mapCodecHelper(
    key: CodecData,
    value: CodecData,
    size: ArrayLikeCodecSize<CodecData>,
    description?: string
): CodecData {
    if (size === 'remainder' && (key.fixedSize === null || value.fixedSize === null)) {
        // TODO: Coded error.
        throw new Error('Codecs of "remainder" size must have fixed-size items.');
    }

    return {
        description:
            description ?? `map(${key.description}, ${value.description}; ${getArrayLikeCodecSizeDescription(size)})`,
        fixedSize: getArrayLikeCodecSizeFromChildren(size, [key.fixedSize, value.fixedSize]),
        maxSize: getArrayLikeCodecSizeFromChildren(size, [key.maxSize, value.maxSize]),
    };
}

/**
 * Creates a encoder for a map.
 *
 * @param key - The encoder to use for the map's keys.
 * @param value - The encoder to use for the map's values.
 * @param options - A set of options for the encoder.
 */
export function getMapEncoder<K, V>(
    key: Encoder<K>,
    value: Encoder<V>,
    options: MapCodecOptions<NumberEncoder> = {}
): Encoder<Map<K, V>> {
    const size = options.size ?? getU32Encoder();
    return {
        ...mapCodecHelper(key, value, size, options.description),
        encode: (map: Map<K, V>) => {
            if (typeof size === 'number') {
                assertValidNumberOfItemsForCodec('map', size, map.size);
            }
            const itemBytes = Array.from(map, ([k, v]) => mergeBytes([key.encode(k), value.encode(v)]));
            return mergeBytes([getArrayLikeCodecSizePrefix(size, map.size), ...itemBytes]);
        },
    };
}

/**
 * Creates a decoder for a map.
 *
 * @param key - The decoder to use for the map's keys.
 * @param value - The decoder to use for the map's values.
 * @param options - A set of options for the decoder.
 */
export function getMapDecoder<K, V>(
    key: Decoder<K>,
    value: Decoder<V>,
    options: MapCodecOptions<NumberDecoder> = {}
): Decoder<Map<K, V>> {
    const size = options.size ?? getU32Decoder();
    return {
        ...mapCodecHelper(key, value, size, options.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            const map: Map<K, V> = new Map();
            if (typeof size === 'object' && bytes.slice(offset).length === 0) {
                return [map, offset];
            }
            const [resolvedSize, newOffset] = decodeArrayLikeCodecSize(
                size,
                [key.fixedSize, value.fixedSize],
                bytes,
                offset
            );
            offset = newOffset;
            for (let i = 0; i < resolvedSize; i += 1) {
                const [decodedKey, kOffset] = key.decode(bytes, offset);
                offset = kOffset;
                const [decodedValue, vOffset] = value.decode(bytes, offset);
                offset = vOffset;
                map.set(decodedKey, decodedValue);
            }
            return [map, offset];
        },
    };
}

/**
 * Creates a codec for a map.
 *
 * @param key - The codec to use for the map's keys.
 * @param value - The codec to use for the map's values.
 * @param options - A set of options for the codec.
 */
export function getMapCodec<TK, TV, UK extends TK = TK, UV extends TV = TV>(
    key: Codec<TK, UK>,
    value: Codec<TV, UV>,
    options: MapCodecOptions<NumberCodec> = {}
): Codec<Map<TK, TV>, Map<UK, UV>> {
    return combineCodec(getMapEncoder(key, value, options), getMapDecoder(key, value, options));
}
