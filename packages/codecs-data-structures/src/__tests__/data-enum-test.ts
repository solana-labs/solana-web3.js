import {
    assertIsFixedSize,
    assertIsVariableSize,
    isFixedSize,
    isVariableSize,
    offsetCodec,
    resizeCodec,
} from '@solana/codecs-core';
import { getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getStringCodec } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_DATA_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import { getArrayCodec } from '../array';
import { getBooleanCodec } from '../boolean';
import { getDataEnumCodec } from '../data-enum';
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
        | { __kind: 'Click'; x: number; y: number } // Struct variant.
        | { __kind: 'KeyPress'; fields: [string] } // Tuple variant.
        | { __kind: 'PageLoad' } // Empty variant.
        | { __kind: 'PageUnload' }; // Empty variant (using empty struct).

    const getWebEvent = () =>
        [
            ['PageLoad', unit()],
            [
                'Click',
                struct([
                    ['x', u8()],
                    ['y', u8()],
                ]),
            ],
            ['KeyPress', struct([['fields', tuple([string()])]])],
            ['PageUnload', struct([])],
        ] as const;

    const getSameSizeVariants = () =>
        [
            ['A', struct([['value', u16()]])],
            [
                'B',
                struct([
                    ['x', u8()],
                    ['y', u8()],
                ]),
            ],
            ['C', struct([['items', array(boolean(), { size: 2 })]])],
        ] as const;

    const getU64Enum = () =>
        [
            ['A', unit()],
            ['B', struct([['value', u64()]])],
        ] as const;

    it('encodes empty variants', () => {
        const pageLoad: WebEvent = { __kind: 'PageLoad' };
        expect(dataEnum(getWebEvent()).encode(pageLoad)).toStrictEqual(b('00'));
        expect(dataEnum(getWebEvent()).read(b('00'), 0)).toStrictEqual([pageLoad, 1]);
        expect(dataEnum(getWebEvent()).read(b('ffff00'), 2)).toStrictEqual([pageLoad, 3]);
        const pageUnload: WebEvent = { __kind: 'PageUnload' };
        expect(dataEnum(getWebEvent()).encode(pageUnload)).toStrictEqual(b('03'));
        expect(dataEnum(getWebEvent()).read(b('03'), 0)).toStrictEqual([pageUnload, 1]);
        expect(dataEnum(getWebEvent()).read(b('ffff03'), 2)).toStrictEqual([pageUnload, 3]);
    });

    it('encodes struct variants', () => {
        const click = (x: number, y: number): WebEvent => ({ __kind: 'Click', x, y });
        expect(dataEnum(getWebEvent()).encode(click(0, 0))).toStrictEqual(b('010000'));
        expect(dataEnum(getWebEvent()).read(b('010000'), 0)).toStrictEqual([click(0, 0), 3]);
        expect(dataEnum(getWebEvent()).read(b('ffff010000'), 2)).toStrictEqual([click(0, 0), 5]);
        expect(dataEnum(getWebEvent()).encode(click(1, 2))).toStrictEqual(b('010102'));
        expect(dataEnum(getWebEvent()).read(b('010102'), 0)).toStrictEqual([click(1, 2), 3]);
        expect(dataEnum(getWebEvent()).read(b('ffff010102'), 2)).toStrictEqual([click(1, 2), 5]);
    });

    it('encodes tuple variants', () => {
        const press = (k: string): WebEvent => ({ __kind: 'KeyPress', fields: [k] });
        expect(dataEnum(getWebEvent()).encode(press(''))).toStrictEqual(b('0200000000'));
        expect(dataEnum(getWebEvent()).read(b('0200000000'), 0)).toStrictEqual([press(''), 5]);
        expect(dataEnum(getWebEvent()).read(b('ffff0200000000'), 2)).toStrictEqual([press(''), 7]);
        expect(dataEnum(getWebEvent()).encode(press('1'))).toStrictEqual(b('020100000031'));
        expect(dataEnum(getWebEvent()).read(b('020100000031'), 0)).toStrictEqual([press('1'), 6]);
        expect(dataEnum(getWebEvent()).read(b('ffff020100000031'), 2)).toStrictEqual([press('1'), 8]);
        expect(dataEnum(getWebEvent()).encode(press('語'))).toStrictEqual(b('0203000000e8aa9e'));
        expect(dataEnum(getWebEvent()).encode(press('enter'))).toStrictEqual(b('0205000000656e746572'));
    });

    it('handles invalid variants', () => {
        expect(() => dataEnum(getWebEvent()).encode({ __kind: 'Missing' } as unknown as WebEvent)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_DATA_ENUM_VARIANT, {
                value: 'Missing',
                variants: ['PageLoad', 'Click', 'KeyPress', 'PageUnload'],
            }),
        );
        expect(() => dataEnum(getWebEvent()).read(new Uint8Array([4]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 4,
                maxRange: 3,
                minRange: 0,
            }),
        );
    });

    it('encodes data enums with different From and To types', () => {
        const x = dataEnum(getU64Enum());
        expect(x.encode({ __kind: 'B', value: 2 })).toStrictEqual(b('010200000000000000'));
        expect(x.encode({ __kind: 'B', value: 2n })).toStrictEqual(b('010200000000000000'));
        expect(x.read(b('010200000000000000'), 0)).toStrictEqual([{ __kind: 'B', value: 2n }, 9]);
    });

    it('encodes data enums with custom prefix', () => {
        const x = dataEnum(getSameSizeVariants(), { size: u32() });
        expect(x.encode({ __kind: 'A', value: 42 })).toStrictEqual(b('000000002a00'));
        expect(x.read(b('000000002a00'), 0)).toStrictEqual([{ __kind: 'A', value: 42 }, 6]);
    });

    it('has the right sizes', () => {
        const webEvent = dataEnum(getWebEvent());
        expect(isVariableSize(webEvent)).toBe(true);
        assertIsVariableSize(webEvent);
        expect(webEvent.getSizeFromValue({ __kind: 'PageLoad' })).toBe(1);
        expect(webEvent.getSizeFromValue({ __kind: 'PageUnload' })).toBe(1);
        expect(webEvent.getSizeFromValue({ __kind: 'Click', x: 0, y: 1 })).toBe(1 + 2);
        expect(webEvent.getSizeFromValue({ __kind: 'KeyPress', fields: ['ABC'] })).toBe(1 + 4 + 3);
        expect(webEvent.maxSize).toBeUndefined();

        const sameSize = dataEnum(getSameSizeVariants());
        expect(isFixedSize(sameSize)).toBe(true);
        assertIsFixedSize(sameSize);
        expect(sameSize.fixedSize).toBe(3);

        const sameSizeU32 = dataEnum(getSameSizeVariants(), { size: u32() });
        expect(isFixedSize(sameSizeU32)).toBe(true);
        assertIsFixedSize(sameSizeU32);
        expect(sameSizeU32.fixedSize).toBe(6);

        const u64Enum = dataEnum(getU64Enum());
        expect(isVariableSize(u64Enum)).toBe(true);
        assertIsVariableSize(u64Enum);
        expect(u64Enum.maxSize).toBe(9);
    });

    it('offsets variants within a data enum', () => {
        const offsettedU32 = offsetCodec(
            resizeCodec(u32(), size => size + 2),
            { preOffset: ({ preOffset }) => preOffset + 2 },
        );
        const codec = dataEnum([
            ['Simple', struct([['n', u32()]])],
            ['WithOffset', struct([['n', offsettedU32]])],
        ]);

        const simple = { __kind: 'Simple', n: 42 } as const;
        expect(codec.encode(simple)).toStrictEqual(b('002a000000'));
        expect(codec.read(b('002a000000'), 0)).toStrictEqual([simple, 5]);
        expect(codec.read(b('ffff002a000000'), 2)).toStrictEqual([simple, 7]);

        const withOffset = { __kind: 'WithOffset', n: 42 } as const;
        expect(codec.encode(withOffset)).toStrictEqual(b('0100002a000000'));
        expect(codec.read(b('0100002a000000'), 0)).toStrictEqual([withOffset, 7]);
        expect(codec.read(b('ffff0100002a000000'), 2)).toStrictEqual([withOffset, 9]);
    });
});
