import { SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH, SolanaError } from '@solana/errors';

import { createDecoder, createEncoder } from '../codec';
import { fixCodecSize } from '../fix-codec-size';
import { reverseCodec, reverseDecoder, reverseEncoder } from '../reverse-codec';
import { b, base16 } from './__setup__';

describe('reverseCodec', () => {
    it('can reverse the bytes of a fixed-size codec', () => {
        const s = (size: number) => reverseCodec(fixCodecSize(base16, size));

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
        expect(s(2).decode(b('ff00'))).toBe('00ff');
        expect(s(2).decode(b('00ff'))).toBe('ff00');
        expect(s(4).decode(b('00000001'))).toBe('01000000');
        expect(s(4).decode(b('01000000'))).toBe('00000001');
        expect(s(4).read(b('aaaa01000000bbbb'), 2)).toStrictEqual(['00000001', 6]);
        expect(s(4).read(b('aaaa00000001bbbb'), 2)).toStrictEqual(['01000000', 6]);

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
});
