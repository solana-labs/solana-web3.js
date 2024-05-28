import {
    assertIsFixedSize,
    createDecoder,
    createEncoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
} from './codec';
import { combineCodec } from './combine-codec';
import { ReadonlyUint8Array } from './readonly-uint8array';

function copySourceToTargetInReverse(
    source: ReadonlyUint8Array,
    target_WILL_MUTATE: Uint8Array,
    sourceOffset: number,
    sourceLength: number,
    targetOffset: number = 0,
) {
    while (sourceOffset < --sourceLength) {
        const leftValue = source[sourceOffset];
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceLength];
        target_WILL_MUTATE[sourceLength + targetOffset] = leftValue;
        sourceOffset++;
    }
    if (sourceOffset === sourceLength) {
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceOffset];
    }
}

/**
 * Reverses the bytes of a fixed-size encoder.
 */
export function reverseEncoder<TFrom, TSize extends number>(
    encoder: FixedSizeEncoder<TFrom, TSize>,
): FixedSizeEncoder<TFrom, TSize> {
    assertIsFixedSize(encoder);
    return createEncoder({
        ...encoder,
        write: (value: TFrom, bytes, offset) => {
            const newOffset = encoder.write(value, bytes, offset);
            copySourceToTargetInReverse(
                bytes /* source */,
                bytes /* target_WILL_MUTATE */,
                offset /* sourceOffset */,
                offset + encoder.fixedSize /* sourceLength */,
            );
            return newOffset;
        },
    });
}

/**
 * Reverses the bytes of a fixed-size decoder.
 */
export function reverseDecoder<TTo, TSize extends number>(
    decoder: FixedSizeDecoder<TTo, TSize>,
): FixedSizeDecoder<TTo, TSize> {
    assertIsFixedSize(decoder);
    return createDecoder({
        ...decoder,
        read: (bytes, offset) => {
            const reversedBytes = bytes.slice();
            copySourceToTargetInReverse(
                bytes /* source */,
                reversedBytes /* target_WILL_MUTATE */,
                offset /* sourceOffset */,
                offset + decoder.fixedSize /* sourceLength */,
            );
            return decoder.read(reversedBytes, offset);
        },
    });
}

/**
 * Reverses the bytes of a fixed-size codec.
 */
export function reverseCodec<TFrom, TTo extends TFrom, TSize extends number>(
    codec: FixedSizeCodec<TFrom, TTo, TSize>,
): FixedSizeCodec<TFrom, TTo, TSize> {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
