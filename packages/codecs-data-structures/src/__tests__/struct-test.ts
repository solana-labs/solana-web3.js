import { getU8Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';

import { getNullableCodec } from '../nullable';
import { getStructCodec } from '../struct';
import { b } from './__setup__';

describe('getStructCodec', () => {
    const struct = getStructCodec;
    const string = getStringCodec;
    const nullable = getNullableCodec;
    const u8 = getU8Codec;
    const u64 = getU64Codec;

    it('encodes structs', () => {
        // Empty struct.
        expect(struct([]).encode({})).toStrictEqual(b(''));
        expect(struct([]).decode(b(''))).toStrictEqual([{}, 0]);

        // Person struct.
        const person = struct([
            ['name', string()],
            ['age', u8()],
        ]);
        const alice = { age: 32, name: 'Alice' };
        expect(person.encode(alice)).toStrictEqual(b('05000000416c69636520'));
        expect(person.decode(b('05000000416c69636520'))).toStrictEqual([alice, 10]);
        expect(person.decode(b('ffff05000000416c69636520'), 2)).toStrictEqual([alice, 12]);
        const bob = { age: 28, dob: '1995-06-01', name: 'Bob' };
        expect(person.encode(bob)).toStrictEqual(b('03000000426f621c'));
        expect(person.decode(b('03000000426f621c'))).toStrictEqual([{ age: 28, name: 'Bob' }, 8]);

        // Different From and To types.
        const structU64 = struct<{ value: number | bigint }, { value: bigint }>([['value', u64()]]);
        expect(structU64.encode({ value: 2 })).toStrictEqual(b('0200000000000000'));
        expect(structU64.encode({ value: 2n })).toStrictEqual(b('0200000000000000'));
        expect(structU64.decode(b('0200000000000000'))).toStrictEqual([{ value: 2n }, 8]);
    });

    it('has the right description', () => {
        expect(struct([['age', u8()]]).description).toBe('struct(age: u8)');
        expect(
            struct([
                ['name', string()],
                ['age', u8()],
            ]).description
        ).toBe('struct(name: string(utf8; u32(le)), age: u8)');
        expect(struct([['age', u8()]], { description: 'my struct' }).description).toBe('my struct');
    });

    it('has the right sizes', () => {
        expect(struct([]).fixedSize).toBe(0);
        expect(struct([]).maxSize).toBe(0);
        expect(struct([['age', u8()]]).fixedSize).toBe(1);
        expect(struct([['age', u8()]]).maxSize).toBe(1);
        expect(struct([['age', nullable(u8())]]).fixedSize).toBeNull();
        expect(struct([['age', nullable(u8())]]).maxSize).toBe(2);

        const person = struct([
            ['name', string()],
            ['age', u8()],
        ]);
        expect(person.fixedSize).toBeNull();
        expect(person.maxSize).toBeNull();

        const fixedPerson = struct([
            ['age', u8()],
            ['balance', u64()],
        ]);
        expect(fixedPerson.fixedSize).toBe(9);
        expect(fixedPerson.maxSize).toBe(9);
    });
});
