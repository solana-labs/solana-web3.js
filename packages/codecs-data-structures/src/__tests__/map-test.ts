import { addCodecSizePrefix, fixCodecSize } from '@solana/codecs-core';
import { getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, SolanaError } from '@solana/errors';

import { getMapCodec } from '../map';
import { b } from './__setup__';

describe('getMapCodec', () => {
    const map = getMapCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const u8String = addCodecSizePrefix(getUtf8Codec(), getU8Codec());
    const u32String = addCodecSizePrefix(getUtf8Codec(), getU32Codec());

    it('encodes prefixed maps', () => {
        // Empty.
        expect(map(u8(), u8()).encode(new Map())).toStrictEqual(b('00000000')); // 4-bytes prefix.
        expect(map(u8(), u8()).read(b('00000000'), 0)).toStrictEqual([new Map(), 4]);

        // Empty with custom prefix.
        expect(map(u8(), u8(), { size: u8() }).encode(new Map())).toStrictEqual(b('00')); // 1-byte prefix.
        expect(map(u8(), u8(), { size: u8() }).read(b('00'), 0)).toStrictEqual([new Map(), 1]);

        // Numbers.
        expect(map(u8(), u8()).encode(new Map([[1, 2]]))).toStrictEqual(b('010000000102'));
        expect(map(u8(), u8()).read(b('010000000102'), 0)).toStrictEqual([new Map([[1, 2]]), 6]);
        expect(map(u8(), u8()).read(b('ffff010000000102'), 2)).toStrictEqual([new Map([[1, 2]]), 8]);

        // Strings.
        const letters = new Map([
            ['a', 1],
            ['b', 2],
        ]);
        expect(map(u32String, u8()).encode(letters)).toStrictEqual(b('02000000010000006101010000006202'));
        expect(map(u32String, u8()).read(b('02000000010000006101010000006202'), 0)).toStrictEqual([letters, 16]);

        // Different From and To types.
        const mapU8U64 = map<number, bigint | number, number, bigint>(u8(), u64());
        expect(mapU8U64.encode(new Map().set(42, 2))).toStrictEqual(b('010000002a0200000000000000'));
        expect(mapU8U64.encode(new Map().set(42, 2n))).toStrictEqual(b('010000002a0200000000000000'));
        expect(mapU8U64.read(b('010000002a0200000000000000'), 0)).toStrictEqual([new Map().set(42, 2n), 13]);
    });

    it('encodes fixed maps', () => {
        // Empty.
        expect(map(u8(), u8(), { size: 0 }).encode(new Map())).toStrictEqual(b(''));
        expect(map(u8(), u8(), { size: 0 }).read(b(''), 0)).toStrictEqual([new Map(), 0]);

        // Numbers.
        expect(map(u8(), u8(), { size: 1 }).encode(new Map([[1, 2]]))).toStrictEqual(b('0102'));
        expect(map(u8(), u8(), { size: 1 }).read(b('0102'), 0)).toStrictEqual([new Map([[1, 2]]), 2]);
        expect(map(u8(), u8(), { size: 1 }).read(b('ffff0102'), 2)).toStrictEqual([new Map([[1, 2]]), 4]);

        // Strings.
        const letters = map(u32String, u8(), { size: 2 });
        const lettersMap = new Map([
            ['a', 1],
            ['b', 2],
        ]);
        expect(letters.encode(lettersMap)).toStrictEqual(b('010000006101010000006202'));
        expect(letters.read(b('010000006101010000006202'), 0)).toStrictEqual([lettersMap, 12]);

        // Different From and To types.
        const mapU64 = map<number, bigint | number, number, bigint>(u8(), u64(), {
            size: 1,
        });
        expect(mapU64.encode(new Map([[1, 2]]))).toStrictEqual(b('010200000000000000'));
        expect(mapU64.encode(new Map([[1, 2n]]))).toStrictEqual(b('010200000000000000'));
        expect(mapU64.read(b('010200000000000000'), 0)).toStrictEqual([new Map([[1, 2n]]), 9]);

        // It fails if the map has a different size.
        expect(() => map(u8(), u8(), { size: 1 }).encode(new Map())).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 0,
                codecDescription: 'array',
                expected: 1,
            }),
        );
        expect(() => letters.encode(lettersMap.set('c', 3))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 3,
                codecDescription: 'array',
                expected: 2,
            }),
        );
    });

    it('encodes remainder maps', () => {
        const remainder = { size: 'remainder' } as const;

        // Empty.
        expect(map(u8(), u8(), remainder).encode(new Map())).toStrictEqual(b(''));
        expect(map(u8(), u8(), remainder).read(b(''), 0)).toStrictEqual([new Map(), 0]);

        // Numbers.
        expect(map(u8(), u8(), remainder).encode(new Map([[1, 2]]))).toStrictEqual(b('0102'));
        expect(map(u8(), u8(), remainder).read(b('0102'), 0)).toStrictEqual([new Map([[1, 2]]), 2]);
        expect(map(u8(), u8(), remainder).read(b('ffff0102'), 2)).toStrictEqual([new Map([[1, 2]]), 4]);

        // Strings.
        const letters = map(fixCodecSize(getUtf8Codec(), 1), u8(), { size: 2 });
        const lettersMap = new Map([
            ['a', 1],
            ['b', 2],
        ]);
        expect(letters.encode(lettersMap)).toStrictEqual(b('61016202'));
        expect(letters.read(b('61016202'), 0)).toStrictEqual([lettersMap, 4]);

        // Variable sized items.
        const prefixedLetters = map(u8String, u8(), remainder);
        const prefixedLettersMap = new Map([
            ['a', 6],
            ['bc', 7],
        ]);
        expect(prefixedLetters.encode(prefixedLettersMap)).toStrictEqual(b('01610602626307'));
        expect(prefixedLetters.read(b('01610602626307'), 0)).toStrictEqual([prefixedLettersMap, 7]);

        // Different From and To types.
        const mapU64 = map<number, bigint | number, number, bigint>(u8(), u64(), remainder);
        expect(mapU64.encode(new Map([[1, 2]]))).toStrictEqual(b('010200000000000000'));
        expect(mapU64.encode(new Map([[1, 2n]]))).toStrictEqual(b('010200000000000000'));
        expect(mapU64.read(b('010200000000000000'), 0)).toStrictEqual([new Map([[1, 2n]]), 9]);
    });

    it('has the right sizes', () => {
        const testMap = new Map([
            [1, 2],
            [3, 4],
        ]);
        expect(map(u8(), u8()).getSizeFromValue(testMap)).toBe(4 + 2 * 2);
        expect(map(u8(), u8()).maxSize).toBeUndefined();
        expect(map(u8(), u8(), { size: u8() }).getSizeFromValue(testMap)).toBe(1 + 2 * 2);
        expect(map(u8(), u8(), { size: u8() }).maxSize).toBeUndefined();
        expect(map(u8(), u8(), { size: 'remainder' }).getSizeFromValue(testMap)).toBe(2 * 2);
        expect(map(u8(), u8(), { size: 'remainder' }).maxSize).toBeUndefined();
        expect(map(u8(), u8(), { size: 42 }).fixedSize).toBe(2 * 42);
        expect(map(u8(), u16(), { size: 42 }).fixedSize).toBe(3 * 42);
        expect(map(u8(), u32String, { size: 42 }).maxSize).toBeUndefined();
        expect(map(u8(), u32String, { size: 0 }).fixedSize).toBe(0);
    });
});
