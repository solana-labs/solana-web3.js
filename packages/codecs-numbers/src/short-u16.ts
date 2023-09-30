import { BaseCodecOptions, Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { assertNumberIsBetweenForCodec } from './assertions';

/**
 * Defines the options for the shortU16 serializer.
 */
export type ShortU16CodecOptions = BaseCodecOptions;

/**
 * Encodes short u16 numbers.
 * @see {@link getShortU16Codec} for a more detailed description.
 */
export const getShortU16Encoder = (options: ShortU16CodecOptions = {}): Encoder<number> => ({
    description: options.description ?? 'shortU16',
    encode: (value: number): Uint8Array => {
        assertNumberIsBetweenForCodec('shortU16', 0, 65535, value);
        const bytes = [0];
        for (let ii = 0; ; ii += 1) {
            // Shift the bits of the value over such that the next 7 bits are at the right edge.
            const alignedValue = value >> (ii * 7);
            if (alignedValue === 0) {
                // No more bits to consume.
                break;
            }
            // Extract those 7 bits using a mask.
            const nextSevenBits = 0b1111111 & alignedValue;
            bytes[ii] = nextSevenBits;
            if (ii > 0) {
                // Set the continuation bit of the previous slice.
                bytes[ii - 1] |= 0b10000000;
            }
        }
        return new Uint8Array(bytes);
    },
    fixedSize: null,
    maxSize: 3,
});

/**
 * Decodes short u16 numbers.
 * @see {@link getShortU16Codec} for a more detailed description.
 */
export const getShortU16Decoder = (options: ShortU16CodecOptions = {}): Decoder<number> => ({
    decode: (bytes: Uint8Array, offset = 0): [number, number] => {
        let value = 0;
        let byteCount = 0;
        while (++byteCount) {
            const byteIndex = byteCount - 1;
            const currentByte = bytes[offset + byteIndex];
            const nextSevenBits = 0b1111111 & currentByte;
            // Insert the next group of seven bits into the correct slot of the output value.
            value |= nextSevenBits << (byteIndex * 7);
            if ((currentByte & 0b10000000) === 0) {
                // This byte does not have its continuation bit set. We're done.
                break;
            }
        }
        return [value, offset + byteCount];
    },
    description: options.description ?? 'shortU16',
    fixedSize: null,
    maxSize: 3,
});

/**
 * Encodes and decodes short u16 numbers.
 *
 * Short u16 numbers are the same as u16, but serialized with 1 to 3 bytes.
 * If the value is above 0x7f, the top bit is set and the remaining
 * value is stored in the next bytes. Each byte follows the same
 * pattern until the 3rd byte. The 3rd byte, if needed, uses
 * all 8 bits to store the last byte of the original value.
 */
export const getShortU16Codec = (options: ShortU16CodecOptions = {}): Codec<number> =>
    combineCodec(getShortU16Encoder(options), getShortU16Decoder(options));
