import { Codec } from '@solana/codecs-core';

export const b = (s: string) => base16.encode(s);

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

export const getMockCodec = (
    options: {
        defaultValue?: string;
        description?: string;
        size?: number | null;
    } = {}
) => ({
    decode: jest.fn().mockReturnValue([options.defaultValue ?? '', 0]),
    description: options.description ?? 'mock',
    encode: jest.fn().mockReturnValue(new Uint8Array()),
    fixedSize: options.size ?? null,
    maxSize: options.size ?? null,
});
