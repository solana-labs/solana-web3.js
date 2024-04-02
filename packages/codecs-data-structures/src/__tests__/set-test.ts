import { addCodecSizePrefix, fixCodecSize } from '@solana/codecs-core';
import { getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, SolanaError } from '@solana/errors';

import { getSetCodec } from '../set';
import { b } from './__setup__';

describe('getSetCodec', () => {
    const set = getSetCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const u8String = addCodecSizePrefix(getUtf8Codec(), getU8Codec());
    const u32String = addCodecSizePrefix(getUtf8Codec(), getU32Codec());
    const fixedString1 = fixCodecSize(getUtf8Codec(), 1);

    it('encodes prefixed sets', () => {
        // Empty.
        expect(set(u8()).encode(new Set())).toStrictEqual(b('00000000')); // 4-bytes prefix.
        expect(set(u8()).read(b('00000000'), 0)).toStrictEqual([new Set(), 4]);

        // Empty with custom prefix.
        expect(set(u8(), { size: u8() }).encode(new Set())).toStrictEqual(b('00')); // 1-byte prefix.
        expect(set(u8(), { size: u8() }).read(b('00'), 0)).toStrictEqual([new Set(), 1]);

        // Numbers.
        expect(set(u8()).encode(new Set([42, 1, 2]))).toStrictEqual(b('030000002a0102'));
        expect(set(u8()).read(b('030000002a0102'), 0)).toStrictEqual([new Set([42, 1, 2]), 4 + 3]);
        expect(set(u8()).read(b('ffff030000002a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 2 + 4 + 3]);

        // Strings.
        expect(set(u32String).encode(new Set(['a', 'b']))).toStrictEqual(b('0200000001000000610100000062'));
        expect(set(u32String).read(b('0200000001000000610100000062'), 0)).toStrictEqual([new Set(['a', 'b']), 4 + 10]);

        // Different From and To types.
        const setU64 = set<bigint | number, bigint>(u64());
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('010000000200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('010000000200000000000000'));
        expect(setU64.read(b('010000000200000000000000'), 0)).toStrictEqual([new Set([2n]), 4 + 8]);
    });

    it('encodes fixed sets', () => {
        // Empty.
        expect(set(u8(), { size: 0 }).encode(new Set())).toStrictEqual(b(''));
        expect(set(u8(), { size: 0 }).read(b(''), 0)).toStrictEqual([new Set(), 0]);

        // Numbers.
        expect(set(u8(), { size: 3 }).encode(new Set([42, 1, 2]))).toStrictEqual(b('2a0102'));
        expect(set(u8(), { size: 3 }).read(b('2a0102'), 0)).toStrictEqual([new Set([42, 1, 2]), 3]);
        expect(set(u8(), { size: 3 }).read(b('ffff2a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 5]);

        // Strings.
        expect(set(u32String, { size: 2 }).encode(new Set(['a', 'b']))).toStrictEqual(b('01000000610100000062'));
        expect(set(u32String, { size: 2 }).read(b('01000000610100000062'), 0)).toStrictEqual([new Set(['a', 'b']), 10]);

        // Different From and To types.
        const setU64 = set<bigint | number, bigint>(u64(), { size: 1 });
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.read(b('0200000000000000'), 0)).toStrictEqual([new Set([2n]), 8]);

        // It fails if the set has a different size.
        expect(() => set(u32String, { size: 1 }).encode(new Set())).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 0,
                codecDescription: 'array',
                expected: 1,
            }),
        );
        expect(() => set(u32String, { size: 2 }).encode(new Set(['a', 'b', 'c']))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 3,
                codecDescription: 'array',
                expected: 2,
            }),
        );
    });

    it('encodes remainder sets', () => {
        const remainder = { size: 'remainder' } as const;

        // Empty.
        expect(set(u8(), remainder).encode(new Set())).toStrictEqual(b(''));
        expect(set(u8(), remainder).read(b(''), 0)).toStrictEqual([new Set(), 0]);

        // Numbers.
        expect(set(u8(), remainder).encode(new Set([42, 1, 2]))).toStrictEqual(b('2a0102'));
        expect(set(u8(), remainder).read(b('2a0102'), 0)).toStrictEqual([new Set([42, 1, 2]), 3]);
        expect(set(u8(), remainder).read(b('ffff2a0102'), 2)).toStrictEqual([new Set([42, 1, 2]), 5]);

        // Strings.
        expect(set(fixedString1, remainder).encode(new Set(['a', 'b']))).toStrictEqual(b('6162'));
        expect(set(fixedString1, remainder).read(b('6162'), 0)).toStrictEqual([new Set(['a', 'b']), 2]);

        // Variable sized items.
        expect(set(u8String, remainder).encode(new Set(['a', 'bc']))).toStrictEqual(b('0161026263'));
        expect(set(u8String, remainder).read(b('0161026263'), 0)).toStrictEqual([new Set(['a', 'bc']), 5]);

        // Different From and To types.
        const setU64 = set<bigint | number, bigint>(u64(), remainder);
        expect(setU64.encode(new Set([2]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.encode(new Set([2n]))).toStrictEqual(b('0200000000000000'));
        expect(setU64.read(b('0200000000000000'), 0)).toStrictEqual([new Set([2n]), 8]);
    });

    it('has the right sizes', () => {
        expect(set(u8()).getSizeFromValue(new Set([1, 2]))).toBe(4 + 2);
        expect(set(u8()).maxSize).toBeUndefined();
        expect(set(u8(), { size: u8() }).getSizeFromValue(new Set([1, 2]))).toBe(1 + 2);
        expect(set(u8(), { size: u8() }).maxSize).toBeUndefined();
        expect(set(u8(), { size: 'remainder' }).getSizeFromValue(new Set([1, 2]))).toBe(2);
        expect(set(u8(), { size: 'remainder' }).maxSize).toBeUndefined();
        expect(set(u8(), { size: 42 }).fixedSize).toBe(42);
        expect(set(u16(), { size: 42 }).fixedSize).toBe(2 * 42);
        expect(set(u32String, { size: 42 }).maxSize).toBeUndefined();
        expect(set(u32String, { size: 0 }).fixedSize).toBe(0);
    });
});
