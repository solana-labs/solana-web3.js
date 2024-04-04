import { addCodecSentinel, addCodecSizePrefix, fixCodecSize, offsetCodec, resizeCodec } from '@solana/codecs-core';
import { getU8Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';

import { getNullableCodec } from '../nullable';
import { getStructCodec } from '../struct';
import { b } from './__setup__';

describe('getStructCodec', () => {
    const struct = getStructCodec;
    const nullable = getNullableCodec;
    const u8 = getU8Codec;
    const u32 = getU32Codec;
    const u64 = getU64Codec;
    const u32String = addCodecSizePrefix(getUtf8Codec(), getU32Codec());
    const fixedString8 = fixCodecSize(getUtf8Codec(), 8);

    it('encodes structs', () => {
        // Empty struct.
        expect(struct([]).encode({})).toStrictEqual(b(''));
        expect(struct([]).decode(b(''))).toStrictEqual({});

        // Person struct.
        const person = struct([
            ['name', u32String],
            ['age', u8()],
        ]);
        const alice = { age: 32, name: 'Alice' };
        expect(person.encode(alice)).toStrictEqual(b('05000000416c69636520'));
        expect(person.read(b('05000000416c69636520'), 0)).toStrictEqual([alice, 10]);
        expect(person.read(b('ffff05000000416c69636520'), 2)).toStrictEqual([alice, 12]);
        const bob = { age: 28, dob: '1995-06-01', name: 'Bob' };
        expect(person.encode(bob)).toStrictEqual(b('03000000426f621c'));
        expect(person.decode(b('03000000426f621c'))).toStrictEqual({ age: 28, name: 'Bob' });

        // Different From and To types.
        const structU64 = struct([['value', u64()]]);
        expect(structU64.encode({ value: 2 })).toStrictEqual(b('0200000000000000'));
        expect(structU64.encode({ value: 2n })).toStrictEqual(b('0200000000000000'));
        expect(structU64.decode(b('0200000000000000'))).toStrictEqual({ value: 2n });
    });

    it('has the right sizes', () => {
        expect(struct([]).fixedSize).toBe(0);
        expect(struct([['age', u8()]]).fixedSize).toBe(1);
        expect(struct([['age', nullable(u8())]]).getSizeFromValue({ age: null })).toBe(1);
        expect(struct([['age', nullable(u8())]]).maxSize).toBe(2);

        const person = struct([
            ['name', u32String],
            ['age', u8()],
        ]);
        expect(person.getSizeFromValue({ age: 42, name: 'ABC' })).toBe(8);
        expect(person.maxSize).toBeUndefined();

        const fixedPerson = struct([
            ['age', u8()],
            ['balance', u64()],
        ]);
        expect(fixedPerson.fixedSize).toBe(9);
    });

    it('offsets fields within a struct', () => {
        const person = struct([
            ['name', fixedString8],
            // There is a 4-byte padding between name and age.
            [
                'age',
                offsetCodec(
                    resizeCodec(u32(), size => size + 4),
                    { preOffset: ({ preOffset }) => preOffset + 4 },
                ),
            ],
        ]);
        const alice = { age: 32, name: 'Alice' };
        expect(person.encode(alice)).toStrictEqual(b('416c6963650000000000000020000000'));
        expect(person.read(b('416c6963650000000000000020000000'), 0)).toStrictEqual([alice, 16]);
        expect(person.read(b('ff416c6963650000000000000020000000'), 1)).toStrictEqual([alice, 17]);
    });

    it('can chain sentinel codecs', () => {
        const person = struct([
            ['firstname', addCodecSentinel(getUtf8Codec(), b('ff'))],
            ['lastname', addCodecSentinel(getUtf8Codec(), b('ff'))],
            ['age', u8()],
        ]);
        const john = { age: 42, firstname: 'John', lastname: 'Doe' };
        expect(person.encode(john)).toStrictEqual(b('4a6f686eff446f65ff2a'));
        expect(person.decode(b('4a6f686eff446f65ff2a'))).toStrictEqual(john);
    });
});
