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

import { isOption, isSome, none, Option, OptionOrNullable, some } from './option.js';
import { wrapNullable } from './unwrap-option.js';

/** Defines the config for option codecs. */
export type OptionCodecConfig<TPrefix extends NumberCodec | NumberDecoder | NumberEncoder> = {
    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `None` value will skip the bytes that would
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
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom>,
    config: OptionCodecConfig<FixedSizeNumberEncoder> & { fixed: true },
): FixedSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: FixedSizeEncoder<TFrom, 0>,
    config?: OptionCodecConfig<FixedSizeNumberEncoder>,
): FixedSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config?: OptionCodecConfig<NumberEncoder> & { fixed?: false },
): VariableSizeEncoder<OptionOrNullable<TFrom>>;
export function getOptionEncoder<TFrom>(
    item: Encoder<TFrom>,
    config: OptionCodecConfig<NumberEncoder> = {},
): Encoder<OptionOrNullable<TFrom>> {
    const prefix = config.prefix ?? getU8Encoder();
    const fixed = config.fixed ?? false;

    const isZeroSizeItem = isFixedSize(item) && isFixedSize(prefix) && item.fixedSize === 0;
    if (fixed || isZeroSizeItem) {
        assertIsFixedSize(item);
        assertIsFixedSize(prefix);
        const fixedSize = prefix.fixedSize + item.fixedSize;
        return createEncoder({
            fixedSize,
            write: (optionOrNullable: OptionOrNullable<TFrom>, bytes, offset) => {
                const option = isOption<TFrom>(optionOrNullable) ? optionOrNullable : wrapNullable(optionOrNullable);
                const prefixOffset = prefix.write(Number(isSome(option)), bytes, offset);
                if (isSome(option)) {
                    item.write(option.value, bytes, prefixOffset);
                }
                return offset + fixedSize;
            },
        });
    }

    return createEncoder({
        getSizeFromValue: (optionOrNullable: OptionOrNullable<TFrom>) => {
            const option = isOption<TFrom>(optionOrNullable) ? optionOrNullable : wrapNullable(optionOrNullable);
            return (
                getEncodedSize(Number(isSome(option)), prefix) +
                (isSome(option) ? getEncodedSize(option.value, item) : 0)
            );
        },
        maxSize: sumCodecSizes([prefix, item].map(getMaxSize)) ?? undefined,
        write: (optionOrNullable: OptionOrNullable<TFrom>, bytes, offset) => {
            const option = isOption<TFrom>(optionOrNullable) ? optionOrNullable : wrapNullable(optionOrNullable);
            offset = prefix.write(Number(isSome(option)), bytes, offset);
            if (isSome(option)) {
                offset = item.write(option.value, bytes, offset);
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
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo>,
    config: OptionCodecConfig<FixedSizeNumberDecoder> & { fixed: true },
): FixedSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: FixedSizeDecoder<TTo, 0>,
    config?: OptionCodecConfig<FixedSizeNumberDecoder>,
): FixedSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config?: OptionCodecConfig<NumberDecoder> & { fixed?: false },
): VariableSizeDecoder<Option<TTo>>;
export function getOptionDecoder<TTo>(
    item: Decoder<TTo>,
    config: OptionCodecConfig<NumberDecoder> = {},
): Decoder<Option<TTo>> {
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
                return [none(), offset];
            }
            const [isSome, prefixOffset] = prefix.read(bytes, offset);
            if (isSome === 0) {
                return [none(), fixedSize !== null ? offset + fixedSize : prefixOffset];
            }
            const [value, newOffset] = item.read(bytes, prefixOffset);
            return [some(value), fixedSize !== null ? offset + fixedSize : newOffset];
        },
    });
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param config - A set of config for the codec.
 */
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo>,
    config: OptionCodecConfig<FixedSizeNumberCodec> & { fixed: true },
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: FixedSizeCodec<TFrom, TTo, 0>,
    config?: OptionCodecConfig<FixedSizeNumberCodec>,
): FixedSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config?: OptionCodecConfig<NumberCodec> & { fixed?: false },
): VariableSizeCodec<OptionOrNullable<TFrom>, Option<TTo>>;
export function getOptionCodec<TFrom, TTo extends TFrom = TFrom>(
    item: Codec<TFrom, TTo>,
    config: OptionCodecConfig<NumberCodec> = {},
): Codec<OptionOrNullable<TFrom>, Option<TTo>> {
    return combineCodec(getOptionEncoder<TFrom>(item, config as object), getOptionDecoder<TTo>(item, config as object));
}

function sumCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce((all, size) => (all === null || size === null ? null : all + size), 0 as number | null);
}

function getMaxSize(codec: { fixedSize: number } | { maxSize?: number }): number | null {
    return isFixedSize(codec) ? codec.fixedSize : codec.maxSize ?? null;
}
