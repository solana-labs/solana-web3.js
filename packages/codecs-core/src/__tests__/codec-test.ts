import { Codec, createCodec, createDecoder, createEncoder, Decoder, Encoder } from '../codec';

describe('Encoder', () => {
    it('can define Encoder instances', () => {
        const myEncoder: Encoder<string> = createEncoder({
            description: 'myEncoder',
            fixedSize: 32,
            write: (value: string, bytes, offset) => {
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                bytes.set(charCodes, offset);
                return offset + 32;
            },
        });

        expect(myEncoder.description).toBe('myEncoder');
        expect(myEncoder.fixedSize).toBe(32);
        expect(myEncoder.maxSize).toBe(32);
        expect(myEncoder.getSize('hello')).toBe(32);

        const expectedBytes = new Uint8Array(32).fill(0);
        expectedBytes.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myEncoder.encode('hello')).toStrictEqual(expectedBytes);

        const writtenBytes = new Uint8Array(32).fill(0);
        expect(myEncoder.write('hello', writtenBytes, 0)).toBe(32);
        expect(writtenBytes).toStrictEqual(expectedBytes);
    });
});

describe('Decoder', () => {
    it('can define Decoder instances', () => {
        const myDecoder: Decoder<string> = createDecoder({
            description: 'myDecoder',
            fixedSize: 32,
            read: (bytes: Uint8Array, offset) => {
                const slice = bytes.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
        });

        expect(myDecoder.description).toBe('myDecoder');
        expect(myDecoder.fixedSize).toBe(32);
        expect(myDecoder.maxSize).toBe(32);

        expect(myDecoder.decode(new Uint8Array([104, 101, 108, 108, 111]))).toBe('hello');
        expect(myDecoder.read(new Uint8Array([104, 101, 108, 108, 111]), 0)).toStrictEqual(['hello', 32]);
    });
});

describe('Codec', () => {
    it('can define Codec instances', () => {
        const myCodec: Codec<string> = createCodec({
            description: 'myCodec',
            fixedSize: 32,
            read: (bytes: Uint8Array, offset) => {
                const slice = bytes.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
            write: (value: string, bytes, offset) => {
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                bytes.set(charCodes, offset);
                return offset + 32;
            },
        });

        expect(myCodec.description).toBe('myCodec');
        expect(myCodec.fixedSize).toBe(32);
        expect(myCodec.maxSize).toBe(32);
        expect(myCodec.getSize('hello')).toBe(32);

        const expectedBytes = new Uint8Array(32).fill(0);
        expectedBytes.set(new Uint8Array([104, 101, 108, 108, 111]));
        expect(myCodec.encode('hello')).toStrictEqual(expectedBytes);

        const writtenBytes = new Uint8Array(32).fill(0);
        expect(myCodec.write('hello', writtenBytes, 0)).toBe(32);
        expect(writtenBytes).toStrictEqual(expectedBytes);

        expect(myCodec.decode(new Uint8Array([104, 101, 108, 108, 111]))).toBe('hello');
        expect(myCodec.read(new Uint8Array([104, 101, 108, 108, 111]), 0)).toStrictEqual(['hello', 32]);
    });
});
