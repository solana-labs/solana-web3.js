import { Codec, Encoder } from '@solana/codecs-core';

import { NumberOutOfRangeCodecError } from '../errors';

export const assertValid = <T>(codec: Codec<T>, number: T, bytes: string, decodedNumber?: T): void => {
    // Serialize.
    const actualBytes = codec.encode(number);
    const [actualBytesBase16] = base16.decode(actualBytes);
    expect(actualBytesBase16).toBe(bytes);

    // Decode.
    const deserialization = codec.decode(actualBytes);
    expect(deserialization[0]).toBe(decodedNumber ?? number);
    expect(deserialization[1]).toBe(actualBytes.length);

    // Decode with offset.
    const deserializationWithOffset = codec.decode(base16.encode(`ffffff${bytes}`), 3);
    expect(deserializationWithOffset[0]).toBe(decodedNumber ?? number);
    expect(deserializationWithOffset[1]).toBe(actualBytes.length + 3);
};

export const assertRangeError = <T>(encoder: Encoder<T>, number: T): void => {
    expect(() => encoder.encode(number)).toThrow(NumberOutOfRangeCodecError);
};

export const base16: Codec<string> = {
    decode(buffer, offset = 0) {
        const value = buffer.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, buffer.length];
    },
    description: 'base16',
    encode(value: string) {
        const lowercaseValue = value.toLowerCase();
        if (!lowercaseValue.match(/^[0123456789abcdef]*$/)) {
            throw new Error('Invalid base16 string');
        }
        const matches = lowercaseValue.match(/.{1,2}/g);
        return Uint8Array.from(matches ? matches.map((byte: string) => parseInt(byte, 16)) : []);
    },
    fixedSize: null,
    maxSize: null,
};
