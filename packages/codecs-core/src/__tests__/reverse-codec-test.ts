import { Decoder, Encoder } from '../codec';
import { fixCodec } from '../fix-codec';
import { reverseCodec, reverseDecoder, reverseEncoder } from '../reverse-codec';
import { b, base16 } from './__setup__';

describe('reverseCodec', () => {
    it('can reverse the bytes of a fixed-size codec', () => {
        const s = (size: number) => reverseCodec(fixCodec(base16, size));

        // Encode.
        expect(s(1).encode('00')).toStrictEqual(b('00'));
        expect(s(2).encode('00ff')).toStrictEqual(b('ff00'));
        expect(s(2).encode('ff00')).toStrictEqual(b('00ff'));
        expect(s(4).encode('00000001')).toStrictEqual(b('01000000'));
        expect(s(4).encode('01000000')).toStrictEqual(b('00000001'));
        expect(s(8).encode('0000000000000001')).toStrictEqual(b('0100000000000000'));
        expect(s(8).encode('0100000000000000')).toStrictEqual(b('0000000000000001'));
        expect(s(32).encode(`01${'00'.repeat(31)}`)).toStrictEqual(b(`${'00'.repeat(31)}01`));
        expect(s(32).encode(`${'00'.repeat(31)}01`)).toStrictEqual(b(`01${'00'.repeat(31)}`));

        // Decode.
        expect(s(2).decode(b('ff00'))).toStrictEqual(['00ff', 2]);
        expect(s(2).decode(b('00ff'))).toStrictEqual(['ff00', 2]);
        expect(s(4).decode(b('00000001'))).toStrictEqual(['01000000', 4]);
        expect(s(4).decode(b('01000000'))).toStrictEqual(['00000001', 4]);
        expect(s(4).decode(b('aaaa01000000bbbb'), 2)).toStrictEqual(['00000001', 6]);
        expect(s(4).decode(b('aaaa00000001bbbb'), 2)).toStrictEqual(['01000000', 6]);

        // Variable-size codec.
        expect(() => reverseCodec(base16)).toThrow('Cannot reverse a codec of variable size');
    });
});

describe('reverseEncoder', () => {
    it('can reverse the bytes of a fixed-size encoder', () => {
        const encoder: Encoder<number> = {
            description: 'u16',
            encode: (value: number) => new Uint8Array([value, 0]),
            fixedSize: 2,
            maxSize: 2,
        };

        const reversedEncoder = reverseEncoder(encoder);
        expect(reversedEncoder.description).toBe('u16');
        expect(reversedEncoder.fixedSize).toBe(2);
        expect(reversedEncoder.maxSize).toBe(2);
        expect(reversedEncoder.encode(42)).toStrictEqual(new Uint8Array([0, 42]));
        expect(() => reverseEncoder(base16)).toThrow('Cannot reverse a codec of variable size');
    });
});

describe('reverseDecoder', () => {
    it('can reverse the bytes of a fixed-size decoder', () => {
        const decoder: Decoder<string> = {
            decode: (bytes: Uint8Array, offset = 0) => [`${bytes[offset]}-${bytes[offset + 1]}`, offset + 2],
            description: 'u16',
            fixedSize: 2,
            maxSize: 2,
        };

        const reversedDecoder = reverseDecoder(decoder);
        expect(reversedDecoder.description).toBe('u16');
        expect(reversedDecoder.fixedSize).toBe(2);
        expect(reversedDecoder.maxSize).toBe(2);
        expect(reversedDecoder.decode(new Uint8Array([42, 0]))).toStrictEqual(['0-42', 2]);
        expect(() => reverseDecoder(base16)).toThrow('Cannot reverse a codec of variable size');
    });
});
