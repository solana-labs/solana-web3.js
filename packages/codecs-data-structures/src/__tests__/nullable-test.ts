import { getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';

import { getNullableCodec } from '../nullable';
import { b } from './__setup__';

describe('getNullableCodec', () => {
    const nullable = getNullableCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const string = getStringCodec;

    it('encodes nullables', () => {
        // Null.
        expect(nullable(u8()).encode(null)).toStrictEqual(b('00'));
        expect(nullable(u8()).decode(b('00'))).toStrictEqual([null, 1]);
        expect(nullable(u8()).decode(b('ffff00'), 2)).toStrictEqual([null, 3]);

        // Null with custom prefix.
        expect(nullable(u8(), { prefix: u16() }).encode(null)).toStrictEqual(b('0000'));
        expect(nullable(u8(), { prefix: u16() }).decode(b('0000'))).toStrictEqual([null, 2]);

        // Some.
        expect(nullable(u8()).encode(42)).toStrictEqual(b('012a'));
        expect(nullable(u8()).decode(b('012a'))).toStrictEqual([42, 2]);
        expect(nullable(u8()).decode(b('ffff012a'), 2)).toStrictEqual([42, 4]);

        // Some with custom prefix.
        expect(nullable(u8(), { prefix: u16() }).encode(42)).toStrictEqual(b('01002a'));
        expect(nullable(u8(), { prefix: u16() }).decode(b('01002a'))).toStrictEqual([42, 3]);

        // Some with strings.
        expect(nullable(string()).encode('Hello')).toStrictEqual(b('010500000048656c6c6f'));
        expect(nullable(string()).decode(b('010500000048656c6c6f'))).toStrictEqual(['Hello', 10]);

        // Different From and To types.
        const nullableU64 = nullable<number | bigint, bigint>(u64());
        expect(nullableU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(nullableU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(nullableU64.decode(b('010200000000000000'))).toStrictEqual([2n, 9]);
    });

    it('encodes fixed nullables', () => {
        const fixedU8 = nullable(u8(), { fixed: true });
        const fixedU8WithU16Prefix = nullable(u8(), { fixed: true, prefix: u16() });
        const fixedString = nullable(string({ size: 5 }), { fixed: true });

        // Null.
        expect(fixedU8.encode(null)).toStrictEqual(b('0000'));
        expect(fixedU8.decode(b('0000'))).toStrictEqual([null, 2]);
        expect(fixedU8.decode(b('ffff0000'), 2)).toStrictEqual([null, 4]);

        // Null with custom prefix.
        expect(fixedU8WithU16Prefix.encode(null)).toStrictEqual(b('000000'));
        expect(fixedU8WithU16Prefix.decode(b('000000'))).toStrictEqual([null, 3]);

        // Some.
        expect(fixedU8.encode(42)).toStrictEqual(b('012a'));
        expect(fixedU8.decode(b('012a'))).toStrictEqual([42, 2]);
        expect(fixedU8.decode(b('ffff012a'), 2)).toStrictEqual([42, 4]);

        // Some with custom prefix.
        expect(fixedU8WithU16Prefix.encode(42)).toStrictEqual(b('01002a'));
        expect(fixedU8WithU16Prefix.decode(b('01002a'))).toStrictEqual([42, 3]);

        // Some with fixed strings.
        expect(fixedString.encode('Hello')).toStrictEqual(b('0148656c6c6f'));
        expect(fixedString.decode(b('0148656c6c6f'))).toStrictEqual(['Hello', 6]);

        // Different From and To types.
        const nullableU64 = nullable<number | bigint, bigint>(u64());
        expect(nullableU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(nullableU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(nullableU64.decode(b('010200000000000000'))).toStrictEqual([2n, 9]);

        // Fixed nullables must wrap fixed-size items.
        expect(() => nullable(string(), { fixed: true })).toThrow(
            'Fixed nullables can only be used with fixed-size codecs'
        );
    });

    it('has the right description', () => {
        expect(nullable(u8()).description).toBe('nullable(u8; u8)');
        expect(nullable(string()).description).toBe('nullable(string(utf8; u32(le)); u8)');
        expect(nullable(u8(), { prefix: u16() }).description).toBe('nullable(u8; u16(le))');

        // Fixed.
        expect(nullable(u8(), { fixed: true }).description).toBe('nullable(u8; u8; fixed)');
        expect(nullable(string({ size: 5 }), { fixed: true }).description).toBe('nullable(string(utf8; 5); u8; fixed)');
        expect(nullable(u8(), { fixed: true, prefix: u16() }).description).toBe('nullable(u8; u16(le); fixed)');

        // Custom description.
        expect(nullable(u8(), { description: 'My nullable' }).description).toBe('My nullable');
    });

    it('has the right sizes', () => {
        expect(nullable(u8()).fixedSize).toBeNull();
        expect(nullable(u8()).maxSize).toBe(2);
        expect(nullable(string()).fixedSize).toBeNull();
        expect(nullable(string()).maxSize).toBeNull();
        expect(nullable(u8(), { prefix: u16() }).fixedSize).toBeNull();
        expect(nullable(u8(), { prefix: u16() }).maxSize).toBe(3);

        // Fixed.
        expect(nullable(u8(), { fixed: true }).fixedSize).toBe(2);
        expect(nullable(u8(), { fixed: true }).maxSize).toBe(2);
        expect(nullable(string({ size: 5 }), { fixed: true }).fixedSize).toBe(6);
        expect(nullable(string({ size: 5 }), { fixed: true }).maxSize).toBe(6);
        expect(nullable(u8(), { fixed: true, prefix: u16() }).fixedSize).toBe(3);
        expect(nullable(u8(), { fixed: true, prefix: u16() }).maxSize).toBe(3);
    });
});
