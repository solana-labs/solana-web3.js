import { CodecData, ExpectedFixedSizeCodecError, Offset } from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { InvalidArrayLikeRemainderSizeCodecError, UnrecognizedArrayLikeCodecSizeError } from './errors';
import { sumCodecSizes } from './utils';

/**
 * Represents all the size options for array-like codecs
 * — i.e. `array`, `map` and `set`.
 *
 * It can be one of the following:
 * - a {@link NumberCodec} that prefixes its content with its size.
 * - a fixed number of items.
 * - or `'remainder'` to infer the number of items by dividing
 *   the rest of the buffer by the fixed size of its item.
 *   Note that this option is only available for fixed-size items.
 */
export type ArrayLikeCodecSize<TPrefix extends NumberCodec | NumberEncoder | NumberDecoder | CodecData> =
    | TPrefix
    | number
    | 'remainder';

/** Resolves the size of an array-like codec. */
export function decodeArrayLikeCodecSize(
    size: ArrayLikeCodecSize<NumberDecoder>,
    childrenSizes: (number | null)[],
    bytes: Uint8Array,
    offset: Offset
): [number | bigint, Offset] {
    if (typeof size === 'number') {
        return [size, offset];
    }

    if (typeof size === 'object') {
        return size.decode(bytes, offset);
    }

    if (size === 'remainder') {
        const childrenSize = sumCodecSizes(childrenSizes);
        if (childrenSize === null) {
            throw new ExpectedFixedSizeCodecError('Codecs of "remainder" size must have fixed-size items.');
        }
        const remainder = bytes.slice(offset).length;
        if (remainder % childrenSize !== 0) {
            throw new InvalidArrayLikeRemainderSizeCodecError(remainder, childrenSize);
        }
        return [remainder / childrenSize, offset];
    }

    throw new UnrecognizedArrayLikeCodecSizeError(size);
}

export function getArrayLikeCodecSizeDescription(size: ArrayLikeCodecSize<CodecData>): string {
    return typeof size === 'object' ? size.description : `${size}`;
}

export function getArrayLikeCodecSizeFromChildren(
    size: ArrayLikeCodecSize<CodecData>,
    childrenSizes: (number | null)[]
): number | null {
    if (typeof size !== 'number') return null;
    if (size === 0) return 0;
    const childrenSize = sumCodecSizes(childrenSizes);
    return childrenSize === null ? null : childrenSize * size;
}

export function getArrayLikeCodecSizePrefix(size: ArrayLikeCodecSize<NumberEncoder>, realSize: number): Uint8Array {
    return typeof size === 'object' ? size.encode(realSize) : new Uint8Array();
}
