import {
    combineCodec,
    createDecoder,
    createEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { assertValidBaseString } from './assertions';

/**
 * Encodes a string using a custom alphabet by dividing
 * by the base and handling leading zeroes.
 * @see {@link getBaseXCodec} for a more detailed description.
 */
export const getBaseXEncoder = (alphabet: string): VariableSizeEncoder<string> => {
    return createEncoder({
        getSizeFromValue: (value: string): number => {
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet[0]);
            if (!tailChars) return value.length;

            const base10Number = getBigIntFromBaseX(tailChars, alphabet);
            return leadingZeroes.length + Math.ceil(base10Number.toString(16).length / 2);
        },
        write(value: string, bytes, offset) {
            // Check if the value is valid.
            assertValidBaseString(alphabet, value);
            if (value === '') return offset;

            // Handle leading zeroes.
            const [leadingZeroes, tailChars] = partitionLeadingZeroes(value, alphabet[0]);
            if (!tailChars) {
                bytes.set(new Uint8Array(leadingZeroes.length).fill(0), offset);
                return offset + leadingZeroes.length;
            }

            // From baseX to base10.
            let base10Number = getBigIntFromBaseX(tailChars, alphabet);

            // From base10 to bytes.
            const tailBytes: number[] = [];
            while (base10Number > 0n) {
                tailBytes.unshift(Number(base10Number % 256n));
                base10Number /= 256n;
            }

            const bytesToAdd = [...Array(leadingZeroes.length).fill(0), ...tailBytes];
            bytes.set(bytesToAdd, offset);
            return offset + bytesToAdd.length;
        },
    });
};

/**
 * Decodes a string using a custom alphabet by dividing
 * by the base and handling leading zeroes.
 * @see {@link getBaseXCodec} for a more detailed description.
 */
export const getBaseXDecoder = (alphabet: string): VariableSizeDecoder<string> => {
    return createDecoder({
        read(rawBytes, offset): [string, number] {
            const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
            if (bytes.length === 0) return ['', 0];

            // Handle leading zeroes.
            let trailIndex = bytes.findIndex(n => n !== 0);
            trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
            const leadingZeroes = alphabet[0].repeat(trailIndex);
            if (trailIndex === bytes.length) return [leadingZeroes, rawBytes.length];

            // From bytes to base10.
            const base10Number = bytes.slice(trailIndex).reduce((sum, byte) => sum * 256n + BigInt(byte), 0n);

            // From base10 to baseX.
            const tailChars = getBaseXFromBigInt(base10Number, alphabet);

            return [leadingZeroes + tailChars, rawBytes.length];
        },
    });
};

/**
 * A string codec that requires a custom alphabet and uses
 * the length of that alphabet as the base. It then divides
 * the input by the base as many times as necessary to get
 * the output. It also supports leading zeroes by using the
 * first character of the alphabet as the zero character.
 *
 * This can be used to create codecs such as base10 or base58.
 */
export const getBaseXCodec = (alphabet: string): VariableSizeCodec<string> =>
    combineCodec(getBaseXEncoder(alphabet), getBaseXDecoder(alphabet));

function partitionLeadingZeroes(
    value: string,
    zeroCharacter: string,
): [leadingZeros: string, tailChars: string | undefined] {
    const [leadingZeros, tailChars] = value.split(new RegExp(`((?!${zeroCharacter}).*)`));
    return [leadingZeros, tailChars];
}

function getBigIntFromBaseX(value: string, alphabet: string): bigint {
    const base = BigInt(alphabet.length);
    let sum = 0n;
    for (const char of value) {
        sum *= base;
        sum += BigInt(alphabet.indexOf(char));
    }
    return sum;
}

function getBaseXFromBigInt(value: bigint, alphabet: string): string {
    const base = BigInt(alphabet.length);
    const tailChars = [];
    while (value > 0n) {
        tailChars.unshift(alphabet[Number(value % base)]);
        value /= base;
    }
    return tailChars.join('');
}
