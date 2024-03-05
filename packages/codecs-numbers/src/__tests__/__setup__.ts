import { Codec, createCodec, Encoder } from '@solana/codecs-core';
import { SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE, SolanaError } from '@solana/errors';

export const assertValid = <T>(codec: Codec<T>, number: T, bytes: string, decodedNumber?: T): void => {
    // Serialize.
    const actualBytes = codec.encode(number);
    const actualBytesBase16 = base16.decode(actualBytes);
    expect(actualBytesBase16).toBe(bytes);

    // Decode.
    const deserialization = codec.read(actualBytes, 0);
    expect(deserialization[0]).toBe(decodedNumber ?? number);
    expect(deserialization[1]).toBe(actualBytes.length);

    // Decode with offset.
    const deserializationWithOffset = codec.read(base16.encode(`ffffff${bytes}`), 3);
    expect(deserializationWithOffset[0]).toBe(decodedNumber ?? number);
    expect(deserializationWithOffset[1]).toBe(actualBytes.length + 3);
};

type RangeErrorValues = {
    codecDescription: string;
    max: bigint | number;
    min: bigint | number;
};

export const assertRangeError = <T extends bigint | number>(
    config: RangeErrorValues,
    encoder: Encoder<T>,
    value: T,
): void => {
    const { codecDescription, max, min } = config;
    expect(() => encoder.encode(value)).toThrow(
        new SolanaError(SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE, {
            codecDescription,
            max,
            min,
            value,
        }),
    );
};

export const base16: Codec<string> = createCodec({
    getSizeFromValue: (value: string) => Math.ceil(value.length / 2),
    read(bytes, offset) {
        const value = bytes.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, bytes.length];
    },
    write(value: string, bytes, offset) {
        const matches = value.toLowerCase().match(/.{1,2}/g);
        const hexBytes = matches ? matches.map((byte: string) => parseInt(byte, 16)) : [];
        bytes.set(hexBytes, offset);
        return offset + hexBytes.length;
    },
});
