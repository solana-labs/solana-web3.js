import { SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { getBitArrayCodec } from '../bit-array';
import { b } from './__setup__';

describe('getBitArrayCodec', () => {
    const bitArray = getBitArrayCodec;

    it('encodes bit arrays', () => {
        // Helper method to create an array of booleans.
        const a = (bits: string) => [...bits].map(bit => bit === '1');

        // Single byte, all zeros.
        expect(bitArray(1).encode(a('00000000'))).toStrictEqual(b('00'));
        expect(bitArray(1).read(b('00'), 0)).toStrictEqual([a('00000000'), 1]);
        expect(bitArray(1).read(b('ff00'), 1)).toStrictEqual([a('00000000'), 2]);

        // Single byte, all ones.
        expect(bitArray(1).encode(a('11111111'))).toStrictEqual(b('ff'));
        expect(bitArray(1).read(b('ff'), 0)).toStrictEqual([a('11111111'), 1]);
        expect(bitArray(1).read(b('00ff'), 1)).toStrictEqual([a('11111111'), 2]);

        // Single byte, first 2 bits, forwards.
        expect(bitArray(1).encode(a('11000000'))).toStrictEqual(b('c0'));
        expect(bitArray(1).read(b('c0'), 0)).toStrictEqual([a('11000000'), 1]);
        expect(bitArray(1).read(b('ffc0'), 1)).toStrictEqual([a('11000000'), 2]);

        // Single byte, first 2 bits, backwards.
        expect(bitArray(1, true).encode(a('11000000'))).toStrictEqual(b('03'));
        expect(bitArray(1, true).read(b('03'), 0)).toStrictEqual([a('11000000'), 1]);
        expect(bitArray(1, true).read(b('ff03'), 1)).toStrictEqual([a('11000000'), 2]);

        // Multiple bytes, first 2 bits, forwards.
        const bitsA = '110000000000000000000000';
        expect(bitArray(3).encode(a(bitsA))).toStrictEqual(b('c00000'));
        expect(bitArray(3).read(b('c00000'), 0)).toStrictEqual([a(bitsA), 3]);
        expect(bitArray(3).read(b('ffc00000'), 1)).toStrictEqual([a(bitsA), 4]);

        // Multiple bytes, first 2 bits, backwards.
        expect(bitArray(3, true).encode(a(bitsA))).toStrictEqual(b('000003'));
        expect(bitArray(3, true).read(b('000003'), 0)).toStrictEqual([a(bitsA), 3]);
        expect(bitArray(3, true).read(b('ff000003'), 1)).toStrictEqual([a(bitsA), 4]);

        // Multiple bytes, first half bits, forwards.
        const bitsB = '111111111111000000000000';
        expect(bitArray(3).encode(a(bitsB))).toStrictEqual(b('fff000'));
        expect(bitArray(3).read(b('fff000'), 0)).toStrictEqual([a(bitsB), 3]);
        expect(bitArray(3).read(b('00fff000'), 1)).toStrictEqual([a(bitsB), 4]);

        // Multiple bytes, first half bits, backwards.
        expect(bitArray(3, true).encode(a(bitsB))).toStrictEqual(b('000fff'));
        expect(bitArray(3, true).read(b('000fff'), 0)).toStrictEqual([a(bitsB), 3]);
        expect(bitArray(3, true).read(b('ff000fff'), 1)).toStrictEqual([a(bitsB), 4]);

        // It pads missing boolean values with false.
        expect(bitArray(1).encode(a('101'))).toStrictEqual(b('a0'));
        expect(bitArray(1).read(b('a0'), 0)).toStrictEqual([a('10100000'), 1]);

        // It truncates array of booleans if it is too long.
        expect(bitArray(1).encode(a('000000001'))).toStrictEqual(b('00'));
        expect(bitArray(1).read(b('00'), 0)).toStrictEqual([a('00000000'), 1]);

        // It fails if the byte array is too short.
        expect(() => bitArray(3).read(b('ff'), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                bytesLength: 1,
                codecDescription: 'bitArray',
                expected: 3,
            }),
        );
    });

    it('has the right sizes', () => {
        expect(bitArray(42).fixedSize).toBe(42);
    });
});
