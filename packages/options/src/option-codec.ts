import {
    assertFixedSizeCodec,
    BaseCodecOptions,
    Codec,
    CodecData,
    combineCodec,
    Decoder,
    Encoder,
    fixBytes,
    mergeBytes,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { isOption, isSome, none, Option, OptionOrNullable, some } from './option';
import { wrapNullable } from './unwrap-option';

/** Defines the options for option codecs. */
export type OptionCodecOptions<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
    /**
     * The codec to use for the boolean prefix.
     * @defaultValue u8 prefix.
     */
    prefix?: TPrefix;

    /**
     * Whether the item codec should be of fixed size.
     *
     * When this is true, a `None` value will skip the bytes that would
     * have been used for the item. Note that this will only work if the
     * item codec is of fixed size.
     * @defaultValue `false`
     */
    fixed?: boolean;
};

function sumCodecSizes(sizes: (number | null)[]): number | null {
    return sizes.reduce((all, size) => (all === null || size === null ? null : all + size), 0 as number | null);
}

function optionCodecHelper(item: CodecData, prefix: CodecData, fixed: boolean, description?: string): CodecData {
    let descriptionSuffix = `; ${prefix.description}`;
    let fixedSize = item.fixedSize === 0 ? prefix.fixedSize : null;
    if (fixed) {
        assertFixedSizeCodec(item, 'Fixed options can only be used with fixed-size codecs.');
        assertFixedSizeCodec(prefix, 'Fixed options can only be used with fixed-size prefix.');
        descriptionSuffix += '; fixed';
        fixedSize = prefix.fixedSize + item.fixedSize;
    }

    return {
        description: description ?? `option(${item.description + descriptionSuffix})`,
        fixedSize,
        maxSize: sumCodecSizes([prefix.maxSize, item.maxSize]),
    };
}

/**
 * Creates a encoder for an optional value using `null` as the `None` value.
 *
 * @param item - The encoder to use for the value that may be present.
 * @param options - A set of options for the encoder.
 */
export function getOptionEncoder<T>(
    item: Encoder<T>,
    options: OptionCodecOptions<NumberEncoder> = {}
): Encoder<OptionOrNullable<T>> {
    const prefix = options.prefix ?? getU8Encoder();
    const fixed = options.fixed ?? false;
    return {
        ...optionCodecHelper(item, prefix, fixed, options.description),
        encode: (optionOrNullable: OptionOrNullable<T>) => {
            const option = isOption<T>(optionOrNullable) ? optionOrNullable : wrapNullable(optionOrNullable);
            const prefixByte = prefix.encode(Number(isSome(option)));
            let itemBytes = isSome(option) ? item.encode(option.value) : new Uint8Array();
            itemBytes = fixed ? fixBytes(itemBytes, item.fixedSize as number) : itemBytes;
            return mergeBytes([prefixByte, itemBytes]);
        },
    };
}

/**
 * Creates a decoder for an optional value using `null` as the `None` value.
 *
 * @param item - The decoder to use for the value that may be present.
 * @param options - A set of options for the decoder.
 */
export function getOptionDecoder<T>(
    item: Decoder<T>,
    options: OptionCodecOptions<NumberDecoder> = {}
): Decoder<Option<T>> {
    const prefix = options.prefix ?? getU8Decoder();
    const fixed = options.fixed ?? false;
    return {
        ...optionCodecHelper(item, prefix, fixed, options.description),
        decode: (bytes: Uint8Array, offset = 0) => {
            if (bytes.length - offset <= 0) {
                return [none(), offset];
            }
            const fixedOffset = offset + (prefix.fixedSize ?? 0) + (item.fixedSize ?? 0);
            const [isSome, prefixOffset] = prefix.decode(bytes, offset);
            offset = prefixOffset;
            if (isSome === 0) {
                return [none(), fixed ? fixedOffset : offset];
            }
            const [value, newOffset] = item.decode(bytes, offset);
            offset = newOffset;
            return [some(value), fixed ? fixedOffset : offset];
        },
    };
}

/**
 * Creates a codec for an optional value using `null` as the `None` value.
 *
 * @param item - The codec to use for the value that may be present.
 * @param options - A set of options for the codec.
 */
export function getOptionCodec<T, U extends T = T>(
    item: Codec<T, U>,
    options: OptionCodecOptions<NumberCodec> = {}
): Codec<OptionOrNullable<T>, Option<U>> {
    return combineCodec(getOptionEncoder<T>(item, options), getOptionDecoder<U>(item, options));
}
