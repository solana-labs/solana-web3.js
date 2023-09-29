import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { assertValidBaseString } from './assertions';

/**
 * Encodes a string using a custom alphabet by reslicing the bits of the byte array.
 * @see {@link getBaseXResliceCodec} for a more detailed description.
 */
export const getBaseXResliceEncoder = (alphabet: string, bits: number): Encoder<string> => ({
    description: `base${alphabet.length}`,
    encode(value: string): Uint8Array {
        assertValidBaseString(alphabet, value);
        if (value === '') return new Uint8Array();
        const charIndices = [...value].map(c => alphabet.indexOf(c));
        return new Uint8Array(reslice(charIndices, bits, 8, false));
    },
    fixedSize: null,
    maxSize: null,
});

/**
 * Decodes a string using a custom alphabet by reslicing the bits of the byte array.
 * @see {@link getBaseXResliceCodec} for a more detailed description.
 */
export const getBaseXResliceDecoder = (alphabet: string, bits: number): Decoder<string> => ({
    decode(rawBytes, offset = 0): [string, number] {
        const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
        if (bytes.length === 0) return ['', rawBytes.length];
        const charIndices = reslice([...bytes], 8, bits, true);
        return [charIndices.map(i => alphabet[i]).join(''), rawBytes.length];
    },
    description: `base${alphabet.length}`,
    fixedSize: null,
    maxSize: null,
});

/**
 * A string serializer that reslices bytes into custom chunks
 * of bits that are then mapped to a custom alphabet.
 *
 * This can be used to create serializers whose alphabet
 * is a power of 2 such as base16 or base64.
 */
export const getBaseXResliceCodec = (alphabet: string, bits: number): Codec<string> =>
    combineCodec(getBaseXResliceEncoder(alphabet, bits), getBaseXResliceDecoder(alphabet, bits));

/** Helper function to reslice the bits inside bytes. */
function reslice(input: number[], inputBits: number, outputBits: number, useRemainder: boolean): number[] {
    const output = [];
    let accumulator = 0;
    let bitsInAccumulator = 0;
    const mask = (1 << outputBits) - 1;
    for (const value of input) {
        accumulator = (accumulator << inputBits) | value;
        bitsInAccumulator += inputBits;
        while (bitsInAccumulator >= outputBits) {
            bitsInAccumulator -= outputBits;
            output.push((accumulator >> bitsInAccumulator) & mask);
        }
    }
    if (useRemainder && bitsInAccumulator > 0) {
        output.push((accumulator << (outputBits - bitsInAccumulator)) & mask);
    }
    return output;
}
