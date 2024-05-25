import { SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH, SolanaError } from '@solana/errors';

import { createDecoder, createEncoder } from '../codec';
import { fixCodecSize } from '../fix-codec-size';
import { reverseCodec, reverseDecoder, reverseEncoder } from '../reverse-codec';
import { b, base16 } from './__setup__';

describe('reverseCodec', () => {
    it('can reverse the bytes of a fixed-size codec', () => {
        const s = (size: number) => reverseCodec(fixCodecSize(base16, size));

        // Encode.
        expect(s(1).encode('99')).toStrictEqual(b('99'));
        expect(s(2).encode('99ff')).toStrictEqual(b('ff99'));
        expect(s(2).encode('ff9999')).toStrictEqual(b('99ff'));
        expect(s(3).encode('9999ff')).toStrictEqual(b('ff9999'));
        expect(s(3).encode('ff9999')).toStrictEqual(b('9999ff'));
        expect(s(4).encode('999999ff')).toStrictEqual(b('ff999999'));
        expect(s(4).encode('ff999999')).toStrictEqual(b('999999ff'));
        expect(s(8).encode('99999999999999ff')).toStrictEqual(b('ff99999999999999'));
        expect(s(8).encode('ff99999999999999')).toStrictEqual(b('99999999999999ff'));
        expect(s(32).encode(`ff${'99'.repeat(31)}`)).toStrictEqual(b(`${'99'.repeat(31)}ff`));
        expect(s(32).encode(`${'99'.repeat(31)}ff`)).toStrictEqual(b(`ff${'99'.repeat(31)}`));

        // Decode.
        expect(s(2).decode(b('ff99'))).toBe('99ff');
        expect(s(2).decode(b('99ff'))).toBe('ff99');
        expect(s(3).decode(b('ff9999'))).toBe('9999ff');
        expect(s(3).decode(b('9999ff'))).toBe('ff9999');
        expect(s(3).read(b('aaaaff9999bbbb'), 2)).toStrictEqual(['9999ff', 5]);
        expect(s(3).read(b('aaaa9999ffbbbb'), 2)).toStrictEqual(['ff9999', 5]);
        expect(s(4).decode(b('999999ff'))).toBe('ff999999');
        expect(s(4).decode(b('ff999999'))).toBe('999999ff');
        expect(s(4).read(b('aaaaff999999bbbb'), 2)).toStrictEqual(['999999ff', 6]);
        expect(s(4).read(b('aaaa999999ffbbbb'), 2)).toStrictEqual(['ff999999', 6]);

        // Variable-size codec.
        // @ts-expect-error Reversed codec should be fixed-size.
        expect(() => reverseCodec(base16)).toThrow(new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH));
    });
});

describe('reverseEncoder', () => {
    it('can reverse the bytes of a fixed-size encoder', () => {
        const encoder = createEncoder({
            fixedSize: 2,
            write: (value: number, bytes, offset) => {
                bytes.set([value, 0], offset);
                return offset + 2;
            },
        });

        const reversedEncoder = reverseEncoder(encoder);
        expect(reversedEncoder.fixedSize).toBe(2);
        expect(reversedEncoder.encode(42)).toStrictEqual(new Uint8Array([0, 42]));

        // @ts-expect-error Reversed encoder should be fixed-size.
        expect(() => reverseEncoder(base16)).toThrow(new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH));
    });

    it('gives the encoder access to the unboxed original byte array', () => {
        const write = jest.fn();
        const encoder = createEncoder({
            fixedSize: 2,
            write,
        });

        const reversedEncoder = reverseEncoder(encoder);
        const inputBytes = new Uint8Array([1, 2, 3, 4]);
        const offset = 1;
        reversedEncoder.write(9, inputBytes, offset);
        expect(write).toHaveBeenCalledWith(
            expect.anything(), // We are not testing the value being written
            inputBytes, // The original, unboxed, uncloned bytes.
            expect.anything(), // We are not testing the offset
        );
    });
});

describe('reverseDecoder', () => {
    it('can reverse the bytes of a fixed-size decoder', () => {
        const decoder = createDecoder({
            fixedSize: 2,
            read: (bytes, offset = 0) => [`${bytes[offset]}-${bytes[offset + 1]}`, offset + 2],
        });

        const reversedDecoder = reverseDecoder(decoder);
        expect(reversedDecoder.fixedSize).toBe(2);
        expect(reversedDecoder.read(new Uint8Array([42, 0]), 0)).toStrictEqual(['0-42', 2]);

        // @ts-expect-error Reversed decoder should be fixed-size.
        expect(() => reverseDecoder(base16)).toThrow(new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH));
    });

    it('does not modify the input bytes in-place', () => {
        const decoder = createDecoder({
            fixedSize: 2,
            read: (bytes, offset = 0) => [`${bytes[offset]}-${bytes[offset + 1]}`, offset + 2],
        });

        const reversedDecoder = reverseDecoder(decoder);
        const inputBytes = new Uint8Array([42, 0]);
        reversedDecoder.read(inputBytes, 0);
        expect(inputBytes).toStrictEqual(new Uint8Array([42, 0]));
    });

    it('gives the decoder access to the unboxed original byte array', () => {
        const read = jest.fn();
        const decoder = createDecoder({
            fixedSize: 2,
            read,
        });

        const reversedDecoder = reverseDecoder(decoder);
        const inputBytes = new Uint8Array([1, 2, 3, 4]);
        const offset = 1;
        reversedDecoder.read(inputBytes, offset);
        expect(read).toHaveBeenCalledWith(
            expect.objectContaining([
                1,
                expect.any(Number), // We are not testing the post-reversal bytes, only that the
                expect.any(Number), // original bytes at the end were supplied to the decoder.
                4,
            ]),
            expect.anything(), // We are not testing the offset
        );
    });
});
