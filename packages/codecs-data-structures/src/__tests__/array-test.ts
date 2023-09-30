import { Endian, getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';

import { getArrayCodec } from '../array';
import { b } from './__setup__';

describe('getArrayCodec', () => {
    const array = getArrayCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const string = getStringCodec;

    it('encodes prefixed arrays', () => {
        // Empty.
        expect(array(u8()).encode([])).toStrictEqual(b('00000000')); // 4-bytes prefix.
        expect(array(u8()).decode(b('00000000'))).toStrictEqual([[], 4]);

        // Empty with custom prefix.
        expect(array(u8(), { size: u8() }).encode([])).toStrictEqual(b('00')); // 1-byte prefix.
        expect(array(u8(), { size: u8() }).decode(b('00'))).toStrictEqual([[], 1]);

        // Numbers.
        expect(array(u8()).encode([42, 1, 2])).toStrictEqual(b('030000002a0102'));
        expect(array(u8()).decode(b('030000002a0102'))).toStrictEqual([[42, 1, 2], 4 + 3]);
        expect(array(u8()).decode(b('ffff030000002a0102'), 2)).toStrictEqual([[42, 1, 2], 2 + 4 + 3]);

        // Strings.
        expect(array(string()).encode(['a', 'b'])).toStrictEqual(b('0200000001000000610100000062'));
        expect(array(string()).decode(b('0200000001000000610100000062'))).toStrictEqual([['a', 'b'], 4 + 10]);

        // Different From and To types.
        const arrayU64 = array<number | bigint, bigint>(u64());
        expect(arrayU64.encode([2])).toStrictEqual(b('010000000200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('010000000200000000000000'));
        expect(arrayU64.decode(b('010000000200000000000000'))).toStrictEqual([[2n], 4 + 8]);
    });

    it('encodes fixed arrays', () => {
        // Empty.
        expect(array(u8(), { size: 0 }).encode([])).toStrictEqual(b(''));
        expect(array(u8(), { size: 0 }).decode(b(''))).toStrictEqual([[], 0]);

        // Numbers.
        expect(array(u8(), { size: 3 }).encode([42, 1, 2])).toStrictEqual(b('2a0102'));
        expect(array(u8(), { size: 3 }).decode(b('2a0102'))).toStrictEqual([[42, 1, 2], 3]);
        expect(array(u8(), { size: 3 }).decode(b('ffff2a0102'), 2)).toStrictEqual([[42, 1, 2], 5]);

        // Strings.
        expect(array(string(), { size: 2 }).encode(['a', 'b'])).toStrictEqual(b('01000000610100000062'));
        expect(array(string(), { size: 2 }).decode(b('01000000610100000062'))).toStrictEqual([['a', 'b'], 10]);

        // Different From and To types.
        const arrayU64 = array<number | bigint, bigint>(u64(), { size: 1 });
        expect(arrayU64.encode([2])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.decode(b('0200000000000000'))).toStrictEqual([[2n], 8]);

        // It fails if the array has a different size.
        expect(() => array(string(), { size: 1 }).encode([])).toThrow('Expected [array] to have 1 items, got 0.');
        expect(() => array(string(), { size: 2 }).encode(['a', 'b', 'c'])).toThrow(
            'Expected [array] to have 2 items, got 3.'
        );
    });

    it('encodes remainder arrays', () => {
        const remainder = { size: 'remainder' } as const;

        // Empty.
        expect(array(u8(), remainder).encode([])).toStrictEqual(b(''));
        expect(array(u8(), remainder).decode(b(''))).toStrictEqual([[], 0]);

        // Numbers.
        expect(array(u8(), remainder).encode([42, 1, 2])).toStrictEqual(b('2a0102'));
        expect(array(u8(), remainder).decode(b('2a0102'))).toStrictEqual([[42, 1, 2], 3]);
        expect(array(u8(), remainder).decode(b('ffff2a0102'), 2)).toStrictEqual([[42, 1, 2], 5]);

        // Strings.
        expect(array(string({ size: 1 }), remainder).encode(['a', 'b'])).toStrictEqual(b('6162'));
        expect(array(string({ size: 1 }), remainder).decode(b('6162'))).toStrictEqual([['a', 'b'], 2]);

        // Different From and To types.
        const arrayU64 = array<number | bigint, bigint>(u64(), remainder);
        expect(arrayU64.encode([2])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.encode([2n])).toStrictEqual(b('0200000000000000'));
        expect(arrayU64.decode(b('0200000000000000'))).toStrictEqual([[2n], 8]);

        // It fails with variable size items.
        expect(() => array(string(), remainder)).toThrow('Codecs of "remainder" size must have fixed-size items');
    });

    it('has the right description', () => {
        // Size.
        expect(array(u8(), { size: 42 }).description).toBe('array(u8; 42)');
        expect(array(u8(), { size: 'remainder' }).description).toBe('array(u8; remainder)');
        expect(array(u8()).description).toBe('array(u8; u32(le))');
        expect(array(u8(), { size: u16() }).description).toBe('array(u8; u16(le))');
        expect(array(u8(), { size: u16({ endian: Endian.BIG }) }).description).toBe('array(u8; u16(be))');

        // Custom.
        expect(array(u8(), { description: 'My custom description' }).description).toBe('My custom description');
    });

    it('has the right sizes', () => {
        expect(array(u8()).fixedSize).toBeNull();
        expect(array(u8()).maxSize).toBeNull();
        expect(array(u8(), { size: u8() }).fixedSize).toBeNull();
        expect(array(u8(), { size: u8() }).maxSize).toBeNull();
        expect(array(u8(), { size: 'remainder' }).fixedSize).toBeNull();
        expect(array(u8(), { size: 'remainder' }).maxSize).toBeNull();
        expect(array(u8(), { size: 42 }).fixedSize).toBe(42);
        expect(array(u8(), { size: 42 }).maxSize).toBe(42);
        expect(array(u16(), { size: 42 }).fixedSize).toBe(2 * 42);
        expect(array(u16(), { size: 42 }).maxSize).toBe(2 * 42);
        expect(array(string(), { size: 42 }).fixedSize).toBeNull();
        expect(array(string(), { size: 42 }).fixedSize).toBeNull();
        expect(array(string(), { size: 0 }).maxSize).toBe(0);
        expect(array(string(), { size: 0 }).maxSize).toBe(0);
    });
});
