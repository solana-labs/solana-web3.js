import {
    addCodecSizePrefix,
    assertIsFixedSize,
    assertIsVariableSize,
    isFixedSize,
    isVariableSize,
    offsetCodec,
    resizeCodec,
} from '@solana/codecs-core';
import { getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT,
    SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { getArrayCodec } from '../array';
import { getBooleanCodec } from '../boolean';
import { getDiscriminatedUnionCodec } from '../discriminated-union';
import { getStructCodec } from '../struct';
import { getTupleCodec } from '../tuple';
import { getUnitCodec } from '../unit';
import { b } from './__setup__';

describe('getDiscriminatedUnionCodec', () => {
    const discriminatedUnion = getDiscriminatedUnionCodec;
    const array = getArrayCodec;
    const boolean = getBooleanCodec;
    const struct = getStructCodec;
    const tuple = getTupleCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u32 = getU32Codec;
    const u64 = getU64Codec;
    const unit = getUnitCodec;
    const u32String = addCodecSizePrefix(getUtf8Codec(), getU32Codec());

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
            ['KeyPress', struct([['fields', tuple([u32String])]])],
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
        expect(discriminatedUnion(getWebEvent()).encode(pageLoad)).toStrictEqual(b('00'));
        expect(discriminatedUnion(getWebEvent()).read(b('00'), 0)).toStrictEqual([pageLoad, 1]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff00'), 2)).toStrictEqual([pageLoad, 3]);
        const pageUnload: WebEvent = { __kind: 'PageUnload' };
        expect(discriminatedUnion(getWebEvent()).encode(pageUnload)).toStrictEqual(b('03'));
        expect(discriminatedUnion(getWebEvent()).read(b('03'), 0)).toStrictEqual([pageUnload, 1]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff03'), 2)).toStrictEqual([pageUnload, 3]);
    });

    it('encodes struct variants', () => {
        const click = (x: number, y: number): WebEvent => ({ __kind: 'Click', x, y });
        expect(discriminatedUnion(getWebEvent()).encode(click(0, 0))).toStrictEqual(b('010000'));
        expect(discriminatedUnion(getWebEvent()).read(b('010000'), 0)).toStrictEqual([click(0, 0), 3]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff010000'), 2)).toStrictEqual([click(0, 0), 5]);
        expect(discriminatedUnion(getWebEvent()).encode(click(1, 2))).toStrictEqual(b('010102'));
        expect(discriminatedUnion(getWebEvent()).read(b('010102'), 0)).toStrictEqual([click(1, 2), 3]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff010102'), 2)).toStrictEqual([click(1, 2), 5]);
    });

    it('encodes tuple variants', () => {
        const press = (k: string): WebEvent => ({ __kind: 'KeyPress', fields: [k] });
        expect(discriminatedUnion(getWebEvent()).encode(press(''))).toStrictEqual(b('0200000000'));
        expect(discriminatedUnion(getWebEvent()).read(b('0200000000'), 0)).toStrictEqual([press(''), 5]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff0200000000'), 2)).toStrictEqual([press(''), 7]);
        expect(discriminatedUnion(getWebEvent()).encode(press('1'))).toStrictEqual(b('020100000031'));
        expect(discriminatedUnion(getWebEvent()).read(b('020100000031'), 0)).toStrictEqual([press('1'), 6]);
        expect(discriminatedUnion(getWebEvent()).read(b('ffff020100000031'), 2)).toStrictEqual([press('1'), 8]);
        expect(discriminatedUnion(getWebEvent()).encode(press('語'))).toStrictEqual(b('0203000000e8aa9e'));
        expect(discriminatedUnion(getWebEvent()).encode(press('enter'))).toStrictEqual(b('0205000000656e746572'));
    });

    it('handles invalid variants', () => {
        expect(() => discriminatedUnion(getWebEvent()).encode({ __kind: 'Missing' } as unknown as WebEvent)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_DISCRIMINATED_UNION_VARIANT, {
                value: 'Missing',
                variants: ['PageLoad', 'Click', 'KeyPress', 'PageUnload'],
            }),
        );
        expect(() => discriminatedUnion(getWebEvent()).read(new Uint8Array([4]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, { maxRange: 3, minRange: 0, variant: 4 }),
        );
    });

    it('encodes discriminated unions with different From and To types', () => {
        const codec = discriminatedUnion(getU64Enum());
        expect(codec.encode({ __kind: 'B', value: 2 })).toStrictEqual(b('010200000000000000'));
        expect(codec.encode({ __kind: 'B', value: 2n })).toStrictEqual(b('010200000000000000'));
        expect(codec.read(b('010200000000000000'), 0)).toStrictEqual([{ __kind: 'B', value: 2n }, 9]);
    });

    it('encodes discriminated unions with a custom prefix', () => {
        const codec = discriminatedUnion(getSameSizeVariants(), { size: u32() });
        expect(codec.encode({ __kind: 'A', value: 42 })).toStrictEqual(b('000000002a00'));
        expect(codec.read(b('000000002a00'), 0)).toStrictEqual([{ __kind: 'A', value: 42 }, 6]);
    });

    it('encodes discriminated unions with a custom discriminator property', () => {
        const codec = discriminatedUnion(
            [
                ['small', struct([['value', u8()]])],
                ['large', struct([['value', u32()]])],
            ],
            { discriminator: 'size' },
        );
        expect(codec.encode({ size: 'small', value: 42 })).toStrictEqual(b('002a'));
        expect(codec.read(b('002a'), 0)).toStrictEqual([{ size: 'small', value: 42 }, 2]);
        expect(codec.encode({ size: 'large', value: 42 })).toStrictEqual(b('012a000000'));
        expect(codec.read(b('012a000000'), 0)).toStrictEqual([{ size: 'large', value: 42 }, 5]);
    });

    it('encodes discriminated unions with number discriminator values', () => {
        const codec = discriminatedUnion([
            [1, struct([['one', u8()]])],
            [2, struct([['two', u32()]])],
        ]);
        expect(codec.encode({ __kind: 1, one: 42 })).toStrictEqual(b('002a'));
        expect(codec.read(b('002a'), 0)).toStrictEqual([{ __kind: 1, one: 42 }, 2]);
    });

    it('encodes discriminated unions with boolean discriminator values', () => {
        const codec = discriminatedUnion([
            [true, struct([['truth', u8()]])],
            [false, struct([['lie', u32()]])],
        ]);
        expect(codec.encode({ __kind: true, truth: 42 })).toStrictEqual(b('002a'));
        expect(codec.read(b('002a'), 0)).toStrictEqual([{ __kind: true, truth: 42 }, 2]);
    });

    it('encodes discriminated unions with enum discriminator values', () => {
        enum Event {
            Click,
            KeyPress,
        }
        const codec = discriminatedUnion([
            [
                Event.Click,
                struct([
                    ['x', u8()],
                    ['y', u8()],
                ]),
            ],
            [Event.KeyPress, struct([['key', u32()]])],
        ]);
        expect(codec.encode({ __kind: Event.Click, x: 1, y: 2 })).toStrictEqual(b('000102'));
        expect(codec.read(b('000102'), 0)).toStrictEqual([{ __kind: Event.Click, x: 1, y: 2 }, 3]);
    });

    it('has the right sizes', () => {
        const webEvent = discriminatedUnion(getWebEvent());
        expect(isVariableSize(webEvent)).toBe(true);
        assertIsVariableSize(webEvent);
        expect(webEvent.getSizeFromValue({ __kind: 'PageLoad' })).toBe(1);
        expect(webEvent.getSizeFromValue({ __kind: 'PageUnload' })).toBe(1);
        expect(webEvent.getSizeFromValue({ __kind: 'Click', x: 0, y: 1 })).toBe(1 + 2);
        expect(webEvent.getSizeFromValue({ __kind: 'KeyPress', fields: ['ABC'] })).toBe(1 + 4 + 3);
        expect(webEvent.maxSize).toBeUndefined();

        const sameSize = discriminatedUnion(getSameSizeVariants());
        expect(isFixedSize(sameSize)).toBe(true);
        assertIsFixedSize(sameSize);
        expect(sameSize.fixedSize).toBe(3);

        const sameSizeU32 = discriminatedUnion(getSameSizeVariants(), { size: u32() });
        expect(isFixedSize(sameSizeU32)).toBe(true);
        assertIsFixedSize(sameSizeU32);
        expect(sameSizeU32.fixedSize).toBe(6);

        const u64Enum = discriminatedUnion(getU64Enum());
        expect(isVariableSize(u64Enum)).toBe(true);
        assertIsVariableSize(u64Enum);
        expect(u64Enum.maxSize).toBe(9);
    });

    it('offsets variants within a discriminated union', () => {
        const offsettedU32 = offsetCodec(
            resizeCodec(u32(), size => size + 2),
            { preOffset: ({ preOffset }) => preOffset + 2 },
        );
        const codec = discriminatedUnion([
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
