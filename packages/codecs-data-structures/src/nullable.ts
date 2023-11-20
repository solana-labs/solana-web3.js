import {
    assertFixedSizeCodec,
    BaseCodecConfig,
    Codec,
    CodecData,
    combineCodec,
    Decoder,
    Encoder,
    fixBytes,
    mergeBytes,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { sumCodecSizes } from './utils';

/** Defines the config for nullable codecs. */
export type NullableCodecConfig<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecConfig & {
    /**
     * The codec to use for the boolean prefix.
     * @defaultValue u8 prefix.
     */
    prefix?: TPrefix;

    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `null` value will skip the bytes that would
     * have been used for the item. Note that this will only work if the
     * item codec is of fixed size.
     * @defaultValue `false`
     */
    fixed?: boolean;
};

function nullableCodecHelper(item: CodecData, prefix: CodecData, fixed: boolean, description?: string): CodecData {
    let descriptionSuffix = `; ${prefix.description}`;
    let fixedSize = item.fixedSize === 0 ? prefix.fixedSize : null;
    if (fixed) {
        assertFixedSizeCodec(item, 'Fixed nullables can only be used with fixed-size codecs.');
        assertFixedSizeCodec(prefix, 'Fixed nullables can only be used with fixed-size prefix.');
        descriptionSuffix += '; fixed';
        fixedSize = prefix.fixedSize + item.fixedSize;
    }

    return {
        description: description ?? `nullable(${item.description + descriptionSuffix})`,
        fixedSize,
        maxSize: sumCodecSizes([prefix.maxSize, item.maxSize]),
    };
}

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getNullableEncoder<T>(
    item: Encoder<T>,
    config: NullableCodecConfig<NumberEncoder> = {}
): Encoder<T | null> {
    const prefix = config.prefix ?? getU8Encoder();
    const fixed = config.fixed ?? false;
    return {
        ...nullableCodecHelper(item, prefix, fixed, config.description),
        encode: (option: T | null) => {
            const prefixByte = prefix.encode(Number(option !== null));
            let itemBytes = option !== null ? item.encode(option) : new Uint8Array();
            itemBytes = fixed ? fixBytes(itemBytes, item.fixedSize as number) : itemBytes;
            return mergeBytes([prefixByte, itemBytes]);
        },
    };
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getNullableDecoder<T>(
    item: Decoder<T>,
    config: NullableCodecConfig<NumberDecoder> = {}
): Decoder<T | null> {
    const prefix = config.prefix ?? getU8Decoder();
    const fixed = config.fixed ?? false;
    return {
        ...nullableCodecHelper(item, prefix, fixed, config.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            if (bytes.length - offset <= 0) {
                return [null, offset];
            }
            const fixedOffset = offset + (prefix.fixedSize ?? 0) + (item.fixedSize ?? 0);
            const [isSome, prefixOffset] = prefix.decode(bytes, offset);
            offset = prefixOffset;
            if (isSome === 0) {
                return [null, fixed ? fixedOffset : offset];
            }
            const [value, newOffset] = item.decode(bytes, offset);
            offset = newOffset;
            return [value, fixed ? fixedOffset : offset];
        },
    };
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getNullableCodec<T, U extends T = T>(
    item: Codec<T, U>,
    config: NullableCodecConfig<NumberCodec> = {}
): Codec<T | null, U | null> {
    return combineCodec(getNullableEncoder<T>(item, config), getNullableDecoder<U>(item, config));
}
