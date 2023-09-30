import { Codec, Encoder } from '@solana/codecs-core';

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
    expect(() => encoder.encode(number)).toThrow('expected number to be in the range');
};

export const base16: Codec<string> = {
    decode(bytes, offset = 0) {
        const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, bytes.length];
    },
    description: 'base16',
    encode(value: string) {
        const matches = value.toLowerCase().match(/.{1,2}/g);
        return Uint8Array.from(matches ? matches.map((byte: string) => parseInt(byte, 16)) : []);
    },
    fixedSize: null,
    maxSize: null,
};
