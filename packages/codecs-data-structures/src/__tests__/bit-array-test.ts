import { getBitArrayCodec } from '../bit-array';
import { b } from './__setup__';

describe('getBitArrayCodec', () => {
    const bitArray = getBitArrayCodec;

    it('encodes bit arrays', () => {
        // Helper method to create an array of booleans.
        const a = (bits: string) => [...bits].map(bit => bit === '1');

        // Single byte, all zeros.
        expect(bitArray(1).encode(a('00000000'))).toStrictEqual(b('00'));
        expect(bitArray(1).decode(b('00'))).toStrictEqual([a('00000000'), 1]);
        expect(bitArray(1).decode(b('ff00'), 1)).toStrictEqual([a('00000000'), 2]);

        // Single byte, all ones.
        expect(bitArray(1).encode(a('11111111'))).toStrictEqual(b('ff'));
        expect(bitArray(1).decode(b('ff'))).toStrictEqual([a('11111111'), 1]);
        expect(bitArray(1).decode(b('00ff'), 1)).toStrictEqual([a('11111111'), 2]);

        // Single byte, first 2 bits, forwards.
        expect(bitArray(1).encode(a('11000000'))).toStrictEqual(b('c0'));
        expect(bitArray(1).decode(b('c0'))).toStrictEqual([a('11000000'), 1]);
        expect(bitArray(1).decode(b('ffc0'), 1)).toStrictEqual([a('11000000'), 2]);

        // Single byte, first 2 bits, backwards.
        expect(bitArray(1, true).encode(a('11000000'))).toStrictEqual(b('03'));
        expect(bitArray(1, true).decode(b('03'))).toStrictEqual([a('11000000'), 1]);
        expect(bitArray(1, true).decode(b('ff03'), 1)).toStrictEqual([a('11000000'), 2]);

        // Multiple bytes, first 2 bits, forwards.
        const bitsA = '110000000000000000000000';
        expect(bitArray(3).encode(a(bitsA))).toStrictEqual(b('c00000'));
        expect(bitArray(3).decode(b('c00000'))).toStrictEqual([a(bitsA), 3]);
        expect(bitArray(3).decode(b('ffc00000'), 1)).toStrictEqual([a(bitsA), 4]);

        // Multiple bytes, first 2 bits, backwards.
        expect(bitArray(3, true).encode(a(bitsA))).toStrictEqual(b('000003'));
        expect(bitArray(3, true).decode(b('000003'))).toStrictEqual([a(bitsA), 3]);
        expect(bitArray(3, true).decode(b('ff000003'), 1)).toStrictEqual([a(bitsA), 4]);

        // Multiple bytes, first half bits, forwards.
        const bitsB = '111111111111000000000000';
        expect(bitArray(3).encode(a(bitsB))).toStrictEqual(b('fff000'));
        expect(bitArray(3).decode(b('fff000'))).toStrictEqual([a(bitsB), 3]);
        expect(bitArray(3).decode(b('00fff000'), 1)).toStrictEqual([a(bitsB), 4]);

        // Multiple bytes, first half bits, backwards.
        expect(bitArray(3, true).encode(a(bitsB))).toStrictEqual(b('000fff'));
        expect(bitArray(3, true).decode(b('000fff'))).toStrictEqual([a(bitsB), 3]);
        expect(bitArray(3, true).decode(b('ff000fff'), 1)).toStrictEqual([a(bitsB), 4]);

        // It pads missing boolean values with false.
        expect(bitArray(1).encode(a('101'))).toStrictEqual(b('a0'));
        expect(bitArray(1).decode(b('a0'))).toStrictEqual([a('10100000'), 1]);

        // It truncates array of booleans if it is too long.
        expect(bitArray(1).encode(a('000000001'))).toStrictEqual(b('00'));
        expect(bitArray(1).decode(b('00'))).toStrictEqual([a('00000000'), 1]);

        // It fails if the byte array is too short.
        expect(() => bitArray(3).decode(b('ff'))).toThrow('Codec [bitArray] expected 3 bytes, got 1');
    });

    it('has the right description', () => {
        expect(bitArray(1).description).toBe('bitArray(1)');
        expect(bitArray(1, { backward: true }).description).toBe('bitArray(1; backward)');
        expect(bitArray(1, { description: 'My bit array' }).description).toBe('My bit array');
    });

    it('has the right sizes', () => {
        expect(bitArray(42).fixedSize).toBe(42);
        expect(bitArray(42).maxSize).toBe(42);
    });
});
