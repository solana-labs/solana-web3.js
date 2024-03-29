import { assertByteArrayOffsetIsNotOutOfRange } from './assertions';
import { Codec, createDecoder, createEncoder, Decoder, Encoder, Offset } from './codec';
import { combineCodec } from './combine-codec';
import { ReadonlyUint8Array } from './readonly-uint8array';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEncoder = Encoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDecoder = Decoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCodec = Codec<any>;

type OffsetConfig = {
    postOffset?: PostOffsetFunction;
    preOffset?: PreOffsetFunction;
};

type PreOffsetFunctionScope = {
    /** The entire byte array. */
    bytes: ReadonlyUint8Array | Uint8Array;
    /** The original offset prior to encode or decode. */
    preOffset: Offset;
    /** Wraps the offset to the byte array length. */
    wrapBytes: (offset: Offset) => Offset;
};

type PreOffsetFunction = (scope: PreOffsetFunctionScope) => Offset;
type PostOffsetFunction = (
    scope: PreOffsetFunctionScope & {
        /** The modified offset used to encode or decode. */
        newPreOffset: Offset;
        /** The original offset returned by the encoder or decoder. */
        postOffset: Offset;
    },
) => Offset;

/**
 * Moves the offset of a given encoder.
 */
export function offsetEncoder<TEncoder extends AnyEncoder>(encoder: TEncoder, config: OffsetConfig): TEncoder {
    return createEncoder({
        ...encoder,
        write: (value, bytes, preOffset) => {
            const wrapBytes = (offset: Offset) => modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({ bytes, preOffset, wrapBytes }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange('offsetEncoder', newPreOffset, bytes.length);
            const postOffset = encoder.write(value, bytes, newPreOffset);
            const newPostOffset = config.postOffset
                ? config.postOffset({ bytes, newPreOffset, postOffset, preOffset, wrapBytes })
                : postOffset;
            assertByteArrayOffsetIsNotOutOfRange('offsetEncoder', newPostOffset, bytes.length);
            return newPostOffset;
        },
    }) as TEncoder;
}

/**
 * Moves the offset of a given decoder.
 */
export function offsetDecoder<TDecoder extends AnyDecoder>(decoder: TDecoder, config: OffsetConfig): TDecoder {
    return createDecoder({
        ...decoder,
        read: (bytes, preOffset) => {
            const wrapBytes = (offset: Offset) => modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({ bytes, preOffset, wrapBytes }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange('offsetDecoder', newPreOffset, bytes.length);
            const [value, postOffset] = decoder.read(bytes, newPreOffset);
            const newPostOffset = config.postOffset
                ? config.postOffset({ bytes, newPreOffset, postOffset, preOffset, wrapBytes })
                : postOffset;
            assertByteArrayOffsetIsNotOutOfRange('offsetDecoder', newPostOffset, bytes.length);
            return [value, newPostOffset];
        },
    }) as TDecoder;
}

/**
 * Moves the offset of a given codec.
 */
export function offsetCodec<TCodec extends AnyCodec>(codec: TCodec, config: OffsetConfig): TCodec {
    return combineCodec(offsetEncoder(codec, config), offsetDecoder(codec, config)) as TCodec;
}

/** A modulo function that handles negative dividends and zero divisors. */
function modulo(dividend: number, divisor: number) {
    if (divisor === 0) return 0;
    return ((dividend % divisor) + divisor) % divisor;
}
