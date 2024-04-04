import { addCodecSentinel, addCodecSizePrefix, fixCodecSize, offsetCodec } from '@solana/codecs-core';
import { getI16Codec, getU8Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, SolanaError } from '@solana/errors';

import { getTupleCodec } from '../tuple';
import { b } from './__setup__';

describe('getTupleCodec', () => {
    const tuple = getTupleCodec;
    const i16 = getI16Codec;
    const u8 = getU8Codec;
    const u64 = getU64Codec;
    const u32String = addCodecSizePrefix(getUtf8Codec(), getU32Codec());
    const fixedString8 = fixCodecSize(getUtf8Codec(), 8);

    it('encodes tuples', () => {
        // Encode.
        expect(tuple([]).encode([])).toStrictEqual(b(''));
        expect(tuple([u8()]).encode([42])).toStrictEqual(b('2a'));
        expect(tuple([u8(), i16()]).encode([0, -42])).toStrictEqual(b('00d6ff'));
        expect(tuple([u32String, u8()]).encode(['Hello', 42])).toStrictEqual(b('0500000048656c6c6f2a'));

        // Decode.
        expect(tuple([]).decode(b(''))).toStrictEqual([]);
        expect(tuple([u8()]).decode(b('2a'))).toStrictEqual([42]);
        expect(tuple([u8(), i16()]).decode(b('00d6ff'))).toStrictEqual([0, -42]);
        expect(tuple([u32String, u8()]).decode(b('0500000048656c6c6f2a'))).toStrictEqual(['Hello', 42]);

        // Different From and To types.
        const tupleU8U64 = tuple([u8(), u64()]);
        expect(tupleU8U64.encode([1, 2])).toStrictEqual(b('010200000000000000'));
        expect(tupleU8U64.encode([1, 2n])).toStrictEqual(b('010200000000000000'));
        expect(tupleU8U64.decode(b('010200000000000000'))).toStrictEqual([1, 2n]);
        expect(tupleU8U64.encode([1, 2n ** 63n])).toStrictEqual(b('010000000000000080'));
        expect(tupleU8U64.decode(b('010000000000000080'))).toStrictEqual([1, 2n ** 63n]);

        // Fails if given the wrong number of items.
        // @ts-expect-error Tuple should have the right number of items.
        expect(() => tuple([u8(), u8()]).encode([42])).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_NUMBER_OF_ITEMS, {
                actual: 1,
                codecDescription: 'tuple',
                expected: 2,
            }),
        );
    });

    it('has the right sizes', () => {
        expect(tuple([]).fixedSize).toBe(0);
        expect(tuple([u8()]).fixedSize).toBe(1);
        expect(tuple([u8(), i16()]).fixedSize).toBe(1 + 2);
        expect(tuple([u8(), u32String, i16()]).getSizeFromValue([1, 'ABC', 2])).toBe(1 + (4 + 3) + 2);
        expect(tuple([u8(), u32String, i16()]).maxSize).toBeUndefined();
        expect(tuple([u32String, u8()]).getSizeFromValue(['Hello', 42])).toBe(4 + 5 + 1);
    });

    it('offsets items within a tuple', () => {
        const person = tuple([
            // Name, pushes 8 bytes forward then handles 8 bytes.
            offsetCodec(fixedString8, {
                preOffset: ({ preOffset }) => preOffset + 8,
            }),
            // Age, pushes 16 bytes backward then handles 8 bytes.
            offsetCodec(u64(), {
                postOffset: ({ preOffset }) => preOffset, // Restores original offset.
                preOffset: ({ preOffset }) => preOffset - 16,
            }),
            // The cursor is now at the end of the buffer.
        ]);
        expect(person.encode(['Alice', 32])).toStrictEqual(b('2000000000000000416c696365000000'));
        expect(person.read(b('2000000000000000416c696365000000'), 0)).toStrictEqual([['Alice', 32n], 16]);
        expect(person.read(b('ff2000000000000000416c696365000000'), 1)).toStrictEqual([['Alice', 32n], 17]);
    });

    it('can chain sentinel codecs', () => {
        const person = tuple([
            addCodecSentinel(getUtf8Codec(), b('ff')),
            addCodecSentinel(getUtf8Codec(), b('ff')),
            u8(),
        ]);
        const john = ['John', 'Doe', 42] as const;
        expect(person.encode(john)).toStrictEqual(b('4a6f686eff446f65ff2a'));
        expect(person.decode(b('4a6f686eff446f65ff2a'))).toStrictEqual(john);
    });
});
