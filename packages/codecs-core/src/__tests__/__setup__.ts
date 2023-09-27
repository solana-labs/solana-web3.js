import { Codec } from '../codec';

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

const alphabet = '_abcdefghijklmnopqrstuvwxyz';
export const a1z26: Codec<string> = {
    decode: (bytes, offset = 0) => [[...bytes.slice(offset)].map(byte => alphabet[byte]).join(''), bytes.length],
    description: 'a1z26',
    encode: (value: string) => Uint8Array.from([...value].map(char => alphabet.indexOf(char))),
    fixedSize: null,
    maxSize: null,
};
