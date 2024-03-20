import { offsetCodec, resizeCodec } from '@solana/codecs-core';
import { getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, SolanaError } from '@solana/errors';

import { getArrayCodec } from '../array.js';
import { b } from './__setup__.js';

describe('getArrayCodec', () => {
    const array = getArrayCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const string = getStringCodec;

    it('encodes prefixed arrays', () => {
        // Empty.
        expect(array(u8()).encode([])).toStrictEqual(b('00000000')); // 4-bytes prefix.
        expect(array(u8()).read(b('00000000'), 0)).toStrictEqual([[], 4]);

        // Empty with custom prefix.
        expect(array(u8(), { size: u8() }).encode([])).toStrictEqual(b('00')); // 1-byte prefix.
        expect(array(u8(), { size: u8() }).read(b('00'), 0)).toStrictEqual([[], 1]);

        // Numbers.
        expect(array(u8()).encode([42, 1, 2])).toStrictEqual(b('030000002a0102'));
        expect(array(u8()).read(b('030000002a0102'), 0)).toStrictEqual([[42, 1, 2], 4 + 3]);
        expect(array(u8()).read(b('ffff030000002a0102'), 2)).toStrictEqual([[42, 1, 2], 2 + 4 + 3]);

        // Strings.
        expect(array(string()).encode(['a', 'b'])).toStrictEqual(b('0200000001000000610100000062'));
        expect(array(string()).read(b('0200000001000000610100000062'), 0)).toStrictEqual([['a', 'b'], 4 + 10]);

        // Different From and To types.
        const arrayU64 = array<bigint | number, bigint>(u64());
        expect(arrayU64.encode([2])).toStrictEqual(b('010000000200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('010000000200000000000000'));
        expect(arrayU64.read(b('010000000200000000000000'), 0)).toStrictEqual([[2n], 4 + 8]);
    });

    it('encodes fixed arrays', () => {
        // Empty.
        expect(array(u8(), { size: 0 }).encode([])).toStrictEqual(b(''));
        expect(array(u8(), { size: 0 }).read(b(''), 0)).toStrictEqual([[], 0]);

        // Numbers.
        expect(array(u8(), { size: 3 }).encode([42, 1, 2])).toStrictEqual(b('2a0102'));
        expect(array(u8(), { size: 3 }).read(b('2a0102'), 0)).toStrictEqual([[42, 1, 2], 3]);
        expect(array(u8(), { size: 3 }).read(b('ffff2a0102'), 2)).toStrictEqual([[42, 1, 2], 5]);

        // Strings.
        expect(array(string(), { size: 2 }).encode(['a', 'b'])).toStrictEqual(b('01000000610100000062'));
        expect(array(string(), { size: 2 }).read(b('01000000610100000062'), 0)).toStrictEqual([['a', 'b'], 10]);

        // Different From and To types.
        const arrayU64 = array<bigint | number, bigint>(u64(), { size: 1 });
        expect(arrayU64.encode([2])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.read(b('0200000000000000'), 0)).toStrictEqual([[2n], 8]);

        // It fails if the array has a different size.
        expect(() => array(string(), { size: 1 }).encode([])).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 0,
                codecDescription: 'array',
                expected: 1,
            }),
        );
        expect(() => array(string(), { size: 2 }).encode(['a', 'b', 'c'])).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 3,
                codecDescription: 'array',
                expected: 2,
            }),
        );
    });

    it('encodes remainder arrays', () => {
        const remainder = { size: 'remainder' } as const;

        // Empty.
        expect(array(u8(), remainder).encode([])).toStrictEqual(b(''));
        expect(array(u8(), remainder).read(b(''), 0)).toStrictEqual([[], 0]);

        // Numbers.
        expect(array(u8(), remainder).encode([42, 1, 2])).toStrictEqual(b('2a0102'));
        expect(array(u8(), remainder).read(b('2a0102'), 0)).toStrictEqual([[42, 1, 2], 3]);
        expect(array(u8(), remainder).read(b('ffff2a0102'), 2)).toStrictEqual([[42, 1, 2], 5]);

        // Strings.
        expect(array(string({ size: 1 }), remainder).encode(['a', 'b'])).toStrictEqual(b('6162'));
        expect(array(string({ size: 1 }), remainder).read(b('6162'), 0)).toStrictEqual([['a', 'b'], 2]);

        // Variable sized items.
        expect(array(string({ size: u8() }), remainder).encode(['a', 'bc'])).toStrictEqual(b('0161026263'));
        expect(array(string({ size: u8() }), remainder).read(b('0161026263'), 0)).toStrictEqual([['a', 'bc'], 5]);

        // Different From and To types.
        const arrayU64 = array<bigint | number, bigint>(u64(), remainder);
        expect(arrayU64.encode([2])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.read(b('0200000000000000'), 0)).toStrictEqual([[2n], 8]);
    });

    it('offsets the size of the array', () => {
        const codec = array(u8(), {
            size: offsetCodec(u8(), {
                postOffset: ({ preOffset }) => preOffset,
                preOffset: ({ wrapBytes }) => wrapBytes(-1),
            }),
        });
        expect(codec.encode([65, 66, 67])).toStrictEqual(b('41424303'));
        expect(codec.read(b('41424303'), 0)).toStrictEqual([[65, 66, 67], 3]);
        expect(codec.read(b('ffff41424303'), 2)).toStrictEqual([[65, 66, 67], 5]);
    });

    it('offsets each item in the array', () => {
        const itemCodec = offsetCodec(u8(), {
            preOffset: ({ preOffset }) => preOffset + 2,
        });
        const codec = resizeCodec(array(itemCodec), () => 13);
        expect(codec.encode([65, 66, 67])).toStrictEqual(b('03000000000041000042000043'));
        expect(codec.read(b('03000000000041000042000043'), 0)).toStrictEqual([[65, 66, 67], 13]);
        expect(codec.read(b('ffff03000000000041000042000043'), 2)).toStrictEqual([[65, 66, 67], 15]);
    });

    it('has the right sizes', () => {
        expect(array(u8()).getSizeFromValue([1, 2])).toBe(4 + 2);
        expect(array(u8()).maxSize).toBeUndefined();
        expect(array(u8(), { size: u8() }).getSizeFromValue([1, 2])).toBe(1 + 2);
        expect(array(u8(), { size: u8() }).maxSize).toBeUndefined();
        expect(array(u8(), { size: 'remainder' }).getSizeFromValue([1, 2])).toBe(2);
        expect(array(u8(), { size: 'remainder' }).maxSize).toBeUndefined();
        expect(array(u8(), { size: 42 }).fixedSize).toBe(42);
        expect(array(u16(), { size: 42 }).fixedSize).toBe(2 * 42);
        expect(array(string(), { size: 42 }).maxSize).toBeUndefined();
        expect(array(string(), { size: 0 }).fixedSize).toBe(0);
    });
});
