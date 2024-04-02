import { Codec, createCodec, createDecoder, createEncoder, Encoder } from '../codec';
import { ReadonlyUint8Array } from '../readonly-uint8array';

describe('Encoder', () => {
    it('can define Encoder instances', () => {
        const myEncoder: Encoder<string> = createEncoder({
            fixedSize: 32,
            write: (value: string, bytes, offset) => {
                const charCodes = [...value.slice(0, 32)].map(char => Math.min(char.charCodeAt(0), 255));
                bytes.set(charCodes, offset);
                return offset + 32;
            },
        });

        expect(myEncoder.fixedSize).toBe(32);

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
        const myDecoder = createDecoder({
            fixedSize: 32,
            read: (bytes: ReadonlyUint8Array | Uint8Array, offset) => {
                const slice = bytes.slice(offset, offset + 32);
                const str = [...slice].map(charCode => String.fromCharCode(charCode)).join('');
                return [str, offset + 32];
            },
        });

        expect(myDecoder.fixedSize).toBe(32);

        expect(myDecoder.decode(new Uint8Array([104, 101, 108, 108, 111]))).toBe('hello');
        expect(myDecoder.read(new Uint8Array([104, 101, 108, 108, 111]), 0)).toStrictEqual(['hello', 32]);
    });
});

describe('Codec', () => {
    it('can define Codec instances', () => {
        const myCodec: Codec<string> = createCodec({
            fixedSize: 32,
            read: (bytes: ReadonlyUint8Array | Uint8Array, offset) => {
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

        expect(myCodec.fixedSize).toBe(32);

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
