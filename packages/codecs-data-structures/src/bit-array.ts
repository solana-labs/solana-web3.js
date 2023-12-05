import {
    assertByteArrayHasEnoughBytesForCodec,
    combineCodec,
    createDecoder,
    createEncoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
} from '@solana/codecs-core';

/** Defines the config for bitArray codecs. */
export type BitArrayCodecConfig = {
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
export function getBitArrayEncoder<TSize extends number>(
    size: TSize,
    config: BitArrayCodecConfig | boolean = {},
): FixedSizeEncoder<boolean[], TSize> {
    const parsedConfig: BitArrayCodecConfig = typeof config === 'boolean' ? { backward: config } : config;
    const backward = parsedConfig.backward ?? false;
    return createEncoder({
        fixedSize: size,
        write(value: boolean[], bytes, offset) {
            const bytesToAdd: number[] = [];

            for (let i = 0; i < size; i += 1) {
                let byte = 0;
                for (let j = 0; j < 8; j += 1) {
                    const feature = Number(value[i * 8 + j] ?? 0);
                    byte |= feature << (backward ? j : 7 - j);
                }
                if (backward) {
                    bytesToAdd.unshift(byte);
                } else {
                    bytesToAdd.push(byte);
                }
            }

            bytes.set(bytesToAdd, offset);
            return size;
        },
    });
}

/**
 * Decodes bits into an array of booleans.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param config - A set of config for the decoder.
 */
export function getBitArrayDecoder<TSize extends number>(
    size: TSize,
    config: BitArrayCodecConfig | boolean = {},
): FixedSizeDecoder<boolean[], TSize> {
    const parsedConfig: BitArrayCodecConfig = typeof config === 'boolean' ? { backward: config } : config;
    const backward = parsedConfig.backward ?? false;
    return createDecoder({
        fixedSize: size,
        read(bytes, offset) {
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
    });
}

/**
 * An array of boolean codec that converts booleans to bits and vice versa.
 *
 * @param size - The amount of bytes to use for the bit array.
 * @param config - A set of config for the codec.
 */
export function getBitArrayCodec<TSize extends number>(
    size: TSize,
    config: BitArrayCodecConfig | boolean = {},
): FixedSizeCodec<boolean[], boolean[], TSize> {
    return combineCodec(getBitArrayEncoder(size, config), getBitArrayDecoder(size, config));
}
