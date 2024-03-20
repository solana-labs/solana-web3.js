import {
    assertIsFixedSize,
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
    isFixedSize,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    FixedSizeNumberCodec,
    FixedSizeNumberDecoder,
    FixedSizeNumberEncoder,
    getU8Decoder,
    getU8Encoder,
    NumberCodec,
    NumberDecoder,
    NumberEncoder,
} from '@solana/codecs-numbers';

import { getMaxSize, sumCodecSizes } from './utils.js';

/** Defines the config for nullable codecs. */
export type NullableCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `null` value will skip the bytes that would
     * have been used for the item. Note that this will only work if the
     * item codec is of fixed size.
     * @defaultValue `false`
     */
    fixed?: boolean;

    /**
     * The codec to use for the boolean prefix.
     * @defaultValue u8 prefix.
     */
    prefix?: TPrefix;
};

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param config - A set of config for the encoder.
 */
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: NullableCodecConfig<FixedSizeNumberEncoder> & { fixed: true },
): FixedSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom, 0>,
    config?: NullableCodecConfig<FixedSizeNumberEncoder>,
): FixedSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: NullableCodecConfig<NumberEncoder> & { fixed?: false },
): VariableSizeEncoder<TFrom | null>;
export function getNullableEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: NullableCodecConfig<NumberEncoder> = {},
): Encoder<TFrom | null> {
    const prefix = config.prefix ?? getU8Encoder();
    const fixed = config.fixed ?? false;

    const isZeroSizeItem = isFixedSize(item) && isFixedSize(prefix) && item.fixedSize === 0;
    if (fixed || isZeroSizeItem) {
        assertIsFixedSize(item);
        assertIsFixedSize(prefix);
        const fixedSize = prefix.fixedSize + item.fixedSize;
        return createEncoder({
            fixedSize,
            write: (option: TFrom | null, bytes, offset) => {
                const prefixOffset = prefix.write(Number(option !== null), bytes, offset);
                if (option !== null) {
                    item.write(option, bytes, prefixOffset);
                }
                return offset + fixedSize;
            },
        });
    }

    return createEncoder({
        getSizeFromValue: (option: TFrom | null) =>
            getEncodedSize(Number(option !== null), prefix) + (option !== null ? getEncodedSize(option, item) : 0),
        maxSize: sumCodecSizes([prefix, item].map(getMaxSize)) ?? undefined,
        write: (option: TFrom | null, bytes, offset) => {
            offset = prefix.write(Number(option !== null), bytes, offset);
            if (option !== null) {
                offset = item.write(option, bytes, offset);
            }
            return offset;
        },
    });
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param config - A set of config for the decoder.
 */
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: NullableCodecConfig<FixedSizeNumberDecoder> & { fixed: true },
): FixedSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: FixedSizeDecoder<TTo, 0>,
    config?: NullableCodecConfig<FixedSizeNumberDecoder>,
): FixedSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config?: NullableCodecConfig<NumberDecoder> & { fixed?: false },
): VariableSizeDecoder<TTo | null>;
export function getNullableDecoder<TTo>(
    item: Decoder<TTo>,
    config: NullableCodecConfig<NumberDecoder> = {},
): Decoder<TTo | null> {
    const prefix = config.prefix ?? getU8Decoder();
    const fixed = config.fixed ?? false;

    let fixedSize: number | null = null;
    const isZeroSizeItem = isFixedSize(item) && isFixedSize(prefix) && item.fixedSize === 0;
    if (fixed || isZeroSizeItem) {
        assertIsFixedSize(item);
        assertIsFixedSize(prefix);
        fixedSize = prefix.fixedSize + item.fixedSize;
    }

    return createDecoder({
        ...(fixedSize === null
            ? { maxSize: sumCodecSizes([prefix, item].map(getMaxSize)) ?? undefined }
            : { fixedSize }),
        read: (bytes: Uint8Array, offset) => {
            if (bytes.length - offset <= 0) {
                return [null, offset];
            }
            const [isSome, prefixOffset] = prefix.read(bytes, offset);
            if (isSome === 0) {
                return [null, fixedSize !== null ? offset + fixedSize : prefixOffset];
            }
            const [value, newOffset] = item.read(bytes, prefixOffset);
            return [value, fixedSize !== null ? offset + fixedSize : newOffset];
        },
    });
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: NullableCodecConfig<FixedSizeNumberCodec> & { fixed: true },
): FixedSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo, 0>,
    config?: NullableCodecConfig<FixedSizeNumberCodec>,
): FixedSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: NullableCodecConfig<NumberCodec> & { fixed?: false },
): VariableSizeCodec<TFrom | null, TTo | null>;
export function getNullableCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: NullableCodecConfig<NumberCodec> = {},
): Codec<TFrom | null, TTo | null> {
    const configCast = config as NullableCodecConfig<NumberCodec> & { fixed?: false };
    return combineCodec(getNullableEncoder<TFrom>(item, configCast), getNullableDecoder<TTo>(item, configCast));
}
