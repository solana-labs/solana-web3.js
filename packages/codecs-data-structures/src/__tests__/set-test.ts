import { Endian, getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';

import { getSetCodec } from '../set';
import { b } from './__setup__';

describe('getSetCodec', () => {
    const set = getSetCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const string = getStringCodec;

    it('encodes prefixed sets', () => {
        // Empty.
        expect(set(u8()).encode(new Set())).toStrictEqual(b('00000000')); // 4-bytes prefix.
        expect(set(u8()).decode(b('00000000'))).toStrictEqual([new Set(), 4]);

        // Empty with custom prefix.
        expect(set(u8(), { size: u8() }).encode(new Set())).toStrictEqual(b('00')); // 1-byte prefix.
        expect(set(u8(), { size: u8() }).decode(b('00'))).toStrictEqual([new Set(), 1]);

        // Numbers.
        expect(set(u8()).encode(new Set([42, 1, 2]))).toStrictEqual(b('030000002a0102'));
        expect(set(u8()).decode(b('030000002a0102'))).toStrictEqual([new Set([42, 1, 2]), 4 + 3]);
        expect(set(u8()).decode(b('ffff030000002a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 2 + 4 + 3]);

        // Strings.
        expect(set(string()).encode(new Set(['a', 'b']))).toStrictEqual(b('0200000001000000610100000062'));
        expect(set(string()).decode(b('0200000001000000610100000062'))).toStrictEqual([new Set(['a', 'b']), 4 + 10]);

        // Different From and To types.
        const setU64 = set<number | bigint, bigint>(u64());
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('010000000200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('010000000200000000000000'));
        expect(setU64.decode(b('010000000200000000000000'))).toStrictEqual([new Set([2n]), 4 + 8]);
    });

    it('encodes fixed sets', () => {
        // Empty.
        expect(set(u8(), { size: 0 }).encode(new Set())).toStrictEqual(b(''));
        expect(set(u8(), { size: 0 }).decode(b(''))).toStrictEqual([new Set(), 0]);

        // Numbers.
        expect(set(u8(), { size: 3 }).encode(new Set([42, 1, 2]))).toStrictEqual(b('2a0102'));
        expect(set(u8(), { size: 3 }).decode(b('2a0102'))).toStrictEqual([new Set([42, 1, 2]), 3]);
        expect(set(u8(), { size: 3 }).decode(b('ffff2a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 5]);

        // Strings.
        expect(set(string(), { size: 2 }).encode(new Set(['a', 'b']))).toStrictEqual(b('01000000610100000062'));
        expect(set(string(), { size: 2 }).decode(b('01000000610100000062'))).toStrictEqual([new Set(['a', 'b']), 10]);

        // Different From and To types.
        const setU64 = set<number | bigint, bigint>(u64(), { size: 1 });
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.decode(b('0200000000000000'))).toStrictEqual([new Set([2n]), 8]);

        // It fails if the set has a different size.
        expect(() => set(string(), { size: 1 }).encode(new Set())).toThrow('Expected [set] to have 1 items, got 0.');
        expect(() => set(string(), { size: 2 }).encode(new Set(['a', 'b', 'c']))).toThrow(
            'Expected [set] to have 2 items, got 3.'
        );
    });

    it('encodes remainder sets', () => {
        const remainder = { size: 'remainder' } as const;

        // Empty.
        expect(set(u8(), remainder).encode(new Set())).toStrictEqual(b(''));
        expect(set(u8(), remainder).decode(b(''))).toStrictEqual([new Set(), 0]);

        // Numbers.
        expect(set(u8(), remainder).encode(new Set([42, 1, 2]))).toStrictEqual(b('2a0102'));
        expect(set(u8(), remainder).decode(b('2a0102'))).toStrictEqual([new Set([42, 1, 2]), 3]);
        expect(set(u8(), remainder).decode(b('ffff2a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 5]);

        // Strings.
        expect(set(string({ size: 1 }), remainder).encode(new Set(['a', 'b']))).toStrictEqual(b('6162'));
        expect(set(string({ size: 1 }), remainder).decode(b('6162'))).toStrictEqual([new Set(['a', 'b']), 2]);

        // Different From and To types.
        const setU64 = set<number | bigint, bigint>(u64(), remainder);
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.decode(b('0200000000000000'))).toStrictEqual([new Set([2n]), 8]);

        // It fails with variable size items.
        expect(() => set(string(), remainder)).toThrow('Codecs of "remainder" size must have fixed-size items');
    });

    it('has the right description', () => {
        // Size.
        expect(set(u8(), { size: 42 }).description).toBe('set(u8; 42)');
        expect(set(u8(), { size: 'remainder' }).description).toBe('set(u8; remainder)');
        expect(set(u8()).description).toBe('set(u8; u32(le))');
        expect(set(u8(), { size: u16() }).description).toBe('set(u8; u16(le))');
        expect(set(u8(), { size: u16({ endian: Endian.BIG }) }).description).toBe('set(u8; u16(be))');

        // Custom.
        expect(set(u8(), { description: 'My custom description' }).description).toBe('My custom description');
    });

    it('has the right sizes', () => {
        expect(set(u8()).fixedSize).toBeNull();
        expect(set(u8()).maxSize).toBeNull();
        expect(set(u8(), { size: u8() }).fixedSize).toBeNull();
        expect(set(u8(), { size: u8() }).maxSize).toBeNull();
        expect(set(u8(), { size: 'remainder' }).fixedSize).toBeNull();
        expect(set(u8(), { size: 'remainder' }).maxSize).toBeNull();
        expect(set(u8(), { size: 42 }).fixedSize).toBe(42);
        expect(set(u8(), { size: 42 }).maxSize).toBe(42);
        expect(set(u16(), { size: 42 }).fixedSize).toBe(2 * 42);
        expect(set(u16(), { size: 42 }).maxSize).toBe(2 * 42);
        expect(set(string(), { size: 42 }).fixedSize).toBeNull();
        expect(set(string(), { size: 42 }).fixedSize).toBeNull();
        expect(set(string(), { size: 0 }).maxSize).toBe(0);
        expect(set(string(), { size: 0 }).maxSize).toBe(0);
    });
});
