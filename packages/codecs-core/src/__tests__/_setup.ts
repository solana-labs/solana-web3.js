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

export const utf8: Codec<string> = {
    description: 'utf8',
    fixedSize: null,
    maxSize: null,
    encode(value: string) {
        return new TextEncoder().encode(value);
    },
    decode(buffer, offset = 0) {
        const value = new TextDecoder().decode(buffer.slice(offset));
        // eslint-disable-next-line no-control-regex
        return [value.replace(/\u0000/g, ''), buffer.length];
    },
};
