/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec, Decoder, Encoder } from '../codec';

describe('Encoder', () => {
    it('can define Encoder instances', () => {
        const myEncoder: Encoder<string> = {
            description: 'myEncoder',
            fixedSize: 32,
            maxSize: 32,
            encode: (value: string) => {
                const buffer = new Uint8Array(32).fill(0);
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                buffer.set(new Uint8Array(charCodes));
                return buffer;
            },
        };

        expect(myEncoder.description).toBe('myEncoder');
        expect(myEncoder.fixedSize).toBe(32);
        expect(myEncoder.maxSize).toBe(32);

        const expectedBuffer = new Uint8Array(32).fill(0);
        expectedBuffer.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myEncoder.encode('hello')).toStrictEqual(expectedBuffer);
    });
});

describe('Decoder', () => {
    it('can define Decoder instances', () => {
        const myDecoder: Decoder<string> = {
            description: 'myDecoder',
            fixedSize: 32,
            maxSize: 32,
            decode: (buffer: Uint8Array, offset = 0) => {
                const slice = buffer.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
        };

        expect(myDecoder.description).toBe('myDecoder');
        expect(myDecoder.fixedSize).toBe(32);
        expect(myDecoder.maxSize).toBe(32);
        expect(myDecoder.decode(new Uint8Array([104, 101, 108, 108, 111]))).toStrictEqual(['hello', 32]);
    });
});

describe('Codec', () => {
    it('can define Codec instances', () => {
        const myCodec: Codec<string> = {
            description: 'myCodec',
            fixedSize: 32,
            maxSize: 32,
            encode: (value: string) => {
                const buffer = new Uint8Array(32).fill(0);
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                buffer.set(new Uint8Array(charCodes));
                return buffer;
            },
            decode: (buffer: Uint8Array, offset = 0) => {
                const slice = buffer.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
        };

        expect(myCodec.description).toBe('myCodec');
        expect(myCodec.fixedSize).toBe(32);
        expect(myCodec.maxSize).toBe(32);

        const expectedBuffer = new Uint8Array(32).fill(0);
        expectedBuffer.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myCodec.encode('hello')).toStrictEqual(expectedBuffer);
        expect(myCodec.decode(new Uint8Array([104, 101, 108, 108, 111]))).toStrictEqual(['hello', 32]);
    });
});
