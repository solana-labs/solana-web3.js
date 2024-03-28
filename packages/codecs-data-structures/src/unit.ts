import {
    combineCodec,
    createDecoder,
    createEncoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    ReadonlyUint8Array,
} from '@solana/codecs-core';

/**
 * Creates a void encoder.
 */
export function getUnitEncoder(): FixedSizeEncoder<void, 0> {
    return createEncoder({
        fixedSize: 0,
        write: (_value, _bytes, offset) => offset,
    });
}

/**
 * Creates a void decoder.
 */
export function getUnitDecoder(): FixedSizeDecoder<void, 0> {
    return createDecoder({
        fixedSize: 0,
        read: (_bytes: ReadonlyUint8Array | Uint8Array, offset) => [undefined, offset],
    });
}

/**
 * Creates a void codec.
 */
export function getUnitCodec(): FixedSizeCodec<void, void, 0> {
    return combineCodec(getUnitEncoder(), getUnitDecoder());
}
