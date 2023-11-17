import {
    assertByteArrayHasEnoughBytesForCodec,
    BaseCodecConfig,
    Codec,
    combineCodec,
    Decoder,
    Encoder,
} from '@solana/codecs-core';

/** Defines the config for bitArray codecs. */
export type BitArrayCodecConfig = BaseCodecConfig & {
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
 * @param config - A set of config for the encoder.
 */
export const getBitArrayEncoder = (size: number, config: BitArrayCodecConfig | boolean = {}): Encoder<boolean[]> => {
    const parsedConfig: BitArrayCodecConfig = typeof config === 'boolean' ? { backward: config } : config;
    const backward = parsedConfig.backward ?? false;
    const backwardSuffix = backward ? '; backward' : '';
    return {
        description: parsedConfig.description ?? `bitArray(${size}${backwardSuffix})`,
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
 * @param config - A set of config for the decoder.
 */
export const getBitArrayDecoder = (size: number, config: BitArrayCodecConfig | boolean = {}): Decoder<boolean[]> => {
    const parsedConfig: BitArrayCodecConfig = typeof config === 'boolean' ? { backward: config } : config;
    const backward = parsedConfig.backward ?? false;
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
        description: parsedConfig.description ?? `bitArray(${size}${backwardSuffix})`,
        fixedSize: size,
        maxSize: size,
    };
};

/**
 * An array of boolean codec that converts booleans to bits and vice versa.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param config - A set of config for the codec.
 */
export const getBitArrayCodec = (size: number, config: BitArrayCodecConfig | boolean = {}): Codec<boolean[]> =>
    combineCodec(getBitArrayEncoder(size, config), getBitArrayDecoder(size, config));
