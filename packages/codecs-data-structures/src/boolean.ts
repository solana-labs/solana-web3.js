import {
    assertByteArrayIsNotEmptyForCodec,
    assertFixedSizeCodec,
    BaseCodecOptions,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
} from '@solana/codecs-core';
import { getU8Decoder, getU8Encoder, NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

/** Defines the options for boolean codecs. */
export type BooleanCodecOptions<TSize extends NumberCodec | NumberEncoder | NumberDecoder> = BaseCodecOptions & {
    /**
     * The number codec to delegate to.
     * @defaultValue u8 size.
     */
    size?: TSize;
};

/**
 * Encodes booleans.
 *
 * @param options - A set of options for the encoder.
 */
export function getBooleanEncoder(options: BooleanCodecOptions<NumberEncoder> = {}): Encoder<boolean> {
    const size = options.size ?? getU8Encoder();
    assertFixedSizeCodec(size, 'Codec [bool] requires a fixed size.');

    return {
        description: options.description ?? `bool(${size.description})`,
        encode: (value: boolean) => size.encode(value ? 1 : 0),
        fixedSize: size.fixedSize,
        maxSize: size.fixedSize,
    };
}

/**
 * Decodes booleans.
 *
 * @param options - A set of options for the decoder.
 */
export function getBooleanDecoder(options: BooleanCodecOptions<NumberDecoder> = {}): Decoder<boolean> {
    const size = options.size ?? getU8Decoder();
    assertFixedSizeCodec(size, 'Codec [bool] requires a fixed size.');

    return {
        decode: (bytes: Uint8Array, offset = 0) => {
            assertByteArrayIsNotEmptyForCodec('bool', bytes, offset);
            const [value, vOffset] = size.decode(bytes, offset);
            return [value === 1, vOffset];
        },
        description: options.description ?? `bool(${size.description})`,
        fixedSize: size.fixedSize,
        maxSize: size.fixedSize,
    };
}

/**
 * Creates a boolean codec.
 *
 * @param options - A set of options for the codec.
 */
export function getBooleanCodec(options: BooleanCodecOptions<NumberCodec> = {}): Codec<boolean> {
    return combineCodec(getBooleanEncoder(options), getBooleanDecoder(options));
}
