/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec } from '../codec';

export const base16: Codec<string> = {
    description: 'base16',
    fixedSize: null,
    maxSize: null,
    encode(value: string) {
        const lowercaseValue = value.toLowerCase();
        if (!lowercaseValue.match(/^[0123456789abcdef]*$/)) {
            throw new Error('Invalid base16 string');
        }
        const matches = lowercaseValue.match(/.{1,2}/g);
        return Uint8Array.from(matches ? matches.map((byte: string) => parseInt(byte, 16)) : []);
    },
    decode(buffer, offset = 0) {
        const value = buffer.slice(offset).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        return [value, buffer.length];
    },
};

const alphabet = '_abcdefghijklmnopqrstuvwxyz';
export const a1z26: Codec<string> = {
    description: 'a1z26',
    fixedSize: null,
    maxSize: null,
    encode(value: string) {
        if (!value.match(/^[_abcdefghijklmnopqrstuvwxyz]*$/)) {
            throw new Error('Invalid a1z26 string');
        }
        return Uint8Array.from([...value].map(char => alphabet.indexOf(char)));
    },
    decode(bytes, offset = 0) {
        const slice = bytes.slice(offset);
        if (slice.some(byte => byte > 26)) {
            throw new Error('Invalid a1z26 string');
        }
        return [[...slice].map(byte => alphabet[byte]).join(''), bytes.length];
    },
};
