import {
    assertByteArrayHasEnoughBytesForCodec,
    BaseCodecOptions,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
} from '@solana/codecs-core';

/** Defines the options for bitArray codecs. */
export type BitArrayCodecOptions = BaseCodecOptions & {
    /**
     * Whether to read the bits in reverse order.
     * @defaultValue `false`
     */
    backward?: boolean;
};

/**
 * Encodes an array of booleans into bits.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param options - A set of options for the encoder.
 */
export const getBitArrayEncoder = (size: number, options: BitArrayCodecOptions | boolean = {}): Encoder<boolean[]> => {
    const parsedOptions: BitArrayCodecOptions = typeof options === 'boolean' ? { backward: options } : options;
    const backward = parsedOptions.backward ?? false;
    const backwardSuffix = backward ? '; backward' : '';
    return {
        description: parsedOptions.description ?? `bitArray(${size}${backwardSuffix})`,
        encode(value: boolean[]) {
            const bytes: number[] = [];

            for (let i = 0; i < size; i += 1) {
                let byte = 0;
                for (let j = 0; j < 8; j += 1) {
                    const feature = Number(value[i * 8 + j] ?? 0);
                    byte |= feature << (backward ? j : 7 - j);
                }
                if (backward) {
                    bytes.unshift(byte);
                } else {
                    bytes.push(byte);
                }
            }

            return new Uint8Array(bytes);
        },
        fixedSize: size,
        maxSize: size,
    };
};

/**
 * Decodes bits into an array of booleans.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param options - A set of options for the decoder.
 */
export const getBitArrayDecoder = (size: number, options: BitArrayCodecOptions | boolean = {}): Decoder<boolean[]> => {
    const parsedOptions: BitArrayCodecOptions = typeof options === 'boolean' ? { backward: options } : options;
    const backward = parsedOptions.backward ?? false;
    const backwardSuffix = backward ? '; backward' : '';
    return {
        decode(bytes, offset = 0) {
            assertByteArrayHasEnoughBytesForCodec('bitArray', size, bytes, offset);
            const booleans: boolean[] = [];
            let slice = bytes.slice(offset, offset + size);
            slice = backward ? slice.reverse() : slice;

            slice.forEach(byte => {
                for (let i = 0; i < 8; i += 1) {
                    if (backward) {
                        booleans.push(Boolean(byte & 1));
                        byte >>= 1;
                    } else {
                        booleans.push(Boolean(byte & 0b1000_0000));
                        byte <<= 1;
                    }
                }
            });

            return [booleans, offset + size];
        },
        description: parsedOptions.description ?? `bitArray(${size}${backwardSuffix})`,
        fixedSize: size,
        maxSize: size,
    };
};

/**
 * An array of boolean codec that converts booleans to bits and vice versa.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param options - A set of options for the codec.
 */
export const getBitArrayCodec = (size: number, options: BitArrayCodecOptions | boolean = {}): Codec<boolean[]> =>
    combineCodec(getBitArrayEncoder(size, options), getBitArrayDecoder(size, options));
