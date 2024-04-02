import {
    combineCodec,
    createDecoder,
    createEncoder,
    ReadonlyUint8Array,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

/**
 * Encodes byte arrays as provided.
 *
 * To control the size of the encoded byte array, you can use
 * the `fixEncoderSize` or `addEncoderSizePrefix` functions.
 */
export function getBytesEncoder(): VariableSizeEncoder<ReadonlyUint8Array | Uint8Array> {
    return createEncoder({
        getSizeFromValue: value => value.length,
        write: (value, bytes, offset) => {
            bytes.set(value, offset);
            return offset + value.length;
        },
    });
}

/**
 * Decodes byte arrays as-is.
 *
 * To control the size of the decoded byte array, you can use
 * the `fixDecoderSize` or `addDecoderSizePrefix` functions.
 */
export function getBytesDecoder(): VariableSizeDecoder<ReadonlyUint8Array> {
    return createDecoder({
        read: (bytes, offset) => {
            const slice = bytes.slice(offset);
            return [slice, offset + slice.length];
        },
    });
}

/**
 * Creates a sized bytes codec.
 *
 * To control the size of the encoded and decoded byte arrays,
 * you can use the `fixCodecSize` or `addCodecSizePrefix` functions.
 */
export function getBytesCodec(): VariableSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array> {
    return combineCodec(getBytesEncoder(), getBytesDecoder());
}
