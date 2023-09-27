import { Codec, Decoder, Encoder } from '../codec';

describe('Encoder', () => {
    it('can define Encoder instances', () => {
        const myEncoder: Encoder<string> = {
            description: 'myEncoder',
            encode: (value: string) => {
                const bytes = new Uint8Array(32).fill(0);
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                bytes.set(new Uint8Array(charCodes));
                return bytes;
            },
            fixedSize: 32,
            maxSize: 32,
        };

        expect(myEncoder.description).toBe('myEncoder');
        expect(myEncoder.fixedSize).toBe(32);
        expect(myEncoder.maxSize).toBe(32);

        const expectedBytes = new Uint8Array(32).fill(0);
        expectedBytes.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myEncoder.encode('hello')).toStrictEqual(expectedBytes);
    });
});

describe('Decoder', () => {
    it('can define Decoder instances', () => {
        const myDecoder: Decoder<string> = {
            decode: (bytes: Uint8Array, offset = 0) => {
                const slice = bytes.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
            description: 'myDecoder',
            fixedSize: 32,
            maxSize: 32,
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
            decode: (bytes: Uint8Array, offset = 0) => {
                const slice = bytes.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
            description: 'myCodec',
            encode: (value: string) => {
                const bytes = new Uint8Array(32).fill(0);
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                bytes.set(new Uint8Array(charCodes));
                return bytes;
            },
            fixedSize: 32,
            maxSize: 32,
        };

        expect(myCodec.description).toBe('myCodec');
        expect(myCodec.fixedSize).toBe(32);
        expect(myCodec.maxSize).toBe(32);

        const expectedBytes = new Uint8Array(32).fill(0);
        expectedBytes.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myCodec.encode('hello')).toStrictEqual(expectedBytes);
        expect(myCodec.decode(new Uint8Array([104, 101, 108, 108, 111]))).toStrictEqual(['hello', 32]);
    });
});
