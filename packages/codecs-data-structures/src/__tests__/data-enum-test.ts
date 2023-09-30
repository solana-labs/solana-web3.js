import { getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';

import { getArrayCodec } from '../array';
import { getBooleanCodec } from '../boolean';
import { DataEnumToCodecTuple, getDataEnumCodec } from '../data-enum';
import { getStructCodec } from '../struct';
import { getTupleCodec } from '../tuple';
import { getUnitCodec } from '../unit';
import { b } from './__setup__';

describe('getDataEnumCodec', () => {
    const dataEnum = getDataEnumCodec;
    const array = getArrayCodec;
    const boolean = getBooleanCodec;
    const string = getStringCodec;
    const struct = getStructCodec;
    const tuple = getTupleCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u32 = getU32Codec;
    const u64 = getU64Codec;
    const unit = getUnitCodec;

    type WebEvent =
        | { __kind: 'PageLoad' } // Empty variant.
        | { __kind: 'Click'; x: number; y: number } // Struct variant.
        | { __kind: 'KeyPress'; fields: [string] } // Tuple variant.
        | { __kind: 'PageUnload' }; // Empty variant (using empty struct).

    const getWebEvent = (): DataEnumToCodecTuple<WebEvent> => [
        ['PageLoad', unit()],
        [
            'Click',
            struct<{ x: number; y: number }>([
                ['x', u8()],
                ['y', u8()],
            ]),
        ],
        ['KeyPress', struct<{ fields: [string] }>([['fields', tuple([string()])]])],
        ['PageUnload', struct<object>([])],
    ];

    type SameSizeVariants =
        | { __kind: 'A'; value: number }
        | { __kind: 'B'; x: number; y: number }
        | { __kind: 'C'; items: Array<boolean> };

    const getSameSizeVariants = (): DataEnumToCodecTuple<SameSizeVariants> => [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['A', struct<any>([['value', u16()]])],
        [
            'B',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            struct<any>([
                ['x', u8()],
                ['y', u8()],
            ]),
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['C', struct<any>([['items', array(boolean(), { size: 2 })]])],
    ];

    type U64EnumFrom = { __kind: 'A' } | { __kind: 'B'; value: number | bigint };
    type U64EnumTo = { __kind: 'A' } | { __kind: 'B'; value: bigint };

    const getU64Enum = (): DataEnumToCodecTuple<U64EnumFrom, U64EnumTo> => [
        ['A', unit()],
        ['B', struct<{ value: bigint | number }, { value: bigint }>([['value', u64()]])],
    ];

    it('encodes empty variants', () => {
        const pageLoad: WebEvent = { __kind: 'PageLoad' };
        expect(dataEnum(getWebEvent()).encode(pageLoad)).toStrictEqual(b('00'));
        expect(dataEnum(getWebEvent()).decode(b('00'))).toStrictEqual([pageLoad, 1]);
        expect(dataEnum(getWebEvent()).decode(b('ffff00'), 2)).toStrictEqual([pageLoad, 3]);
        const pageUnload: WebEvent = { __kind: 'PageUnload' };
        expect(dataEnum(getWebEvent()).encode(pageUnload)).toStrictEqual(b('03'));
        expect(dataEnum(getWebEvent()).decode(b('03'))).toStrictEqual([pageUnload, 1]);
        expect(dataEnum(getWebEvent()).decode(b('ffff03'), 2)).toStrictEqual([pageUnload, 3]);
    });

    it('encodes struct variants', () => {
        const click = (x: number, y: number): WebEvent => ({ __kind: 'Click', x, y });
        expect(dataEnum(getWebEvent()).encode(click(0, 0))).toStrictEqual(b('010000'));
        expect(dataEnum(getWebEvent()).decode(b('010000'))).toStrictEqual([click(0, 0), 3]);
        expect(dataEnum(getWebEvent()).decode(b('ffff010000'), 2)).toStrictEqual([click(0, 0), 5]);
        expect(dataEnum(getWebEvent()).encode(click(1, 2))).toStrictEqual(b('010102'));
        expect(dataEnum(getWebEvent()).decode(b('010102'))).toStrictEqual([click(1, 2), 3]);
        expect(dataEnum(getWebEvent()).decode(b('ffff010102'), 2)).toStrictEqual([click(1, 2), 5]);
    });

    it('encodes tuple variants', () => {
        const press = (k: string): WebEvent => ({ __kind: 'KeyPress', fields: [k] });
        expect(dataEnum(getWebEvent()).encode(press(''))).toStrictEqual(b('0200000000'));
        expect(dataEnum(getWebEvent()).decode(b('0200000000'))).toStrictEqual([press(''), 5]);
        expect(dataEnum(getWebEvent()).decode(b('ffff0200000000'), 2)).toStrictEqual([press(''), 7]);
        expect(dataEnum(getWebEvent()).encode(press('1'))).toStrictEqual(b('020100000031'));
        expect(dataEnum(getWebEvent()).decode(b('020100000031'))).toStrictEqual([press('1'), 6]);
        expect(dataEnum(getWebEvent()).decode(b('ffff020100000031'), 2)).toStrictEqual([press('1'), 8]);
        expect(dataEnum(getWebEvent()).encode(press('語'))).toStrictEqual(b('0203000000e8aa9e'));
        expect(dataEnum(getWebEvent()).encode(press('enter'))).toStrictEqual(b('0205000000656e746572'));
    });

    it('handles invalid variants', () => {
        expect(() => dataEnum(getWebEvent()).encode({ __kind: 'Missing' } as unknown as WebEvent)).toThrow(
            'Invalid data enum variant. ' +
                'Expected one of [PageLoad, Click, KeyPress, PageUnload], ' +
                'got "Missing".'
        );
        expect(() => dataEnum(getWebEvent()).decode(new Uint8Array([4]))).toThrow(
            'Enum discriminator out of range. Expected a number between 0 and 3, got 4.'
        );
    });

    it('encodes data enums with different From and To types', () => {
        const x = dataEnum(getU64Enum());
        expect(x.encode({ __kind: 'B', value: 2 })).toStrictEqual(b('010200000000000000'));
        expect(x.encode({ __kind: 'B', value: 2n })).toStrictEqual(b('010200000000000000'));
        expect(x.decode(b('010200000000000000'))).toStrictEqual([{ __kind: 'B', value: 2n }, 9]);
    });

    it('encodes data enums with custom prefix', () => {
        const x = dataEnum(getSameSizeVariants(), { size: u32() });
        expect(x.encode({ __kind: 'A', value: 42 })).toStrictEqual(b('000000002a00'));
        expect(x.decode(b('000000002a00'))).toStrictEqual([{ __kind: 'A', value: 42 }, 6]);
    });

    it('has the right description', () => {
        expect(dataEnum(getWebEvent()).description).toBe(
            'dataEnum(' +
                'PageLoad: unit, ' +
                'Click: struct(x: u8, y: u8), ' +
                'KeyPress: struct(fields: tuple(string(utf8; u32(le)))), ' +
                'PageUnload: struct()' +
                '; u8)'
        );
        expect(dataEnum(getSameSizeVariants()).description).toBe(
            'dataEnum(' +
                'A: struct(value: u16(le)), ' +
                'B: struct(x: u8, y: u8), ' +
                'C: struct(items: array(bool(u8); 2))' +
                '; u8)'
        );
        expect(dataEnum(getU64Enum()).description).toBe('dataEnum(A: unit, B: struct(value: u64(le)); u8)');
        expect(dataEnum(getU64Enum(), { size: u32() }).description).toBe(
            'dataEnum(A: unit, B: struct(value: u64(le)); u32(le))'
        );
        expect(dataEnum(getWebEvent(), { description: 'my data enum' }).description).toBe('my data enum');
    });

    it('has the right sizes', () => {
        expect(dataEnum(getWebEvent()).fixedSize).toBeNull();
        expect(dataEnum(getWebEvent()).maxSize).toBeNull();
        expect(dataEnum(getSameSizeVariants()).fixedSize).toBe(3);
        expect(dataEnum(getSameSizeVariants()).maxSize).toBe(3);
        expect(dataEnum(getSameSizeVariants(), { size: u32() }).fixedSize).toBe(6);
        expect(dataEnum(getSameSizeVariants(), { size: u32() }).maxSize).toBe(6);
        expect(dataEnum(getU64Enum()).fixedSize).toBeNull();
        expect(dataEnum(getU64Enum()).maxSize).toBe(9);
    });
});
