import { getUnitCodec } from '@solana/codecs-data-structures';
import { getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';

import { none, some } from '../option';
import { getOptionCodec } from '../option-codec';
import { b, base16, getMockCodec } from './__setup__';

describe('getOptionCodec', () => {
    const option = getOptionCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;
    const unit = getUnitCodec;

    it('encodes options', () => {
        // None.
        expect(option(u8()).encode(none())).toStrictEqual(b('00'));
        expect(option(u8()).encode(null)).toStrictEqual(b('00'));
        expect(option(u8()).read(b('00'), 0)).toStrictEqual([none(), 1]);
        expect(option(u8()).read(b('ffff00'), 2)).toStrictEqual([none(), 3]);

        // None with custom prefix.
        expect(option(u8(), { prefix: u16() }).encode(none())).toStrictEqual(b('0000'));
        expect(option(u8(), { prefix: u16() }).encode(null)).toStrictEqual(b('0000'));
        expect(option(u8(), { prefix: u16() }).read(b('0000'), 0)).toStrictEqual([none(), 2]);

        // Some.
        expect(option(u8()).encode(some(42))).toStrictEqual(b('012a'));
        expect(option(u8()).encode(42)).toStrictEqual(b('012a'));
        expect(option(u8()).read(b('012a'), 0)).toStrictEqual([some(42), 2]);
        expect(option(u8()).read(b('ffff012a'), 2)).toStrictEqual([some(42), 4]);

        // Some with custom prefix.
        expect(option(u8(), { prefix: u16() }).encode(some(42))).toStrictEqual(b('01002a'));
        expect(option(u8(), { prefix: u16() }).encode(42)).toStrictEqual(b('01002a'));
        expect(option(u8(), { prefix: u16() }).read(b('01002a'), 0)).toStrictEqual([some(42), 3]);

        // Some with variable-size codec.
        const variableSizeMock = getMockCodec({ size: null });
        variableSizeMock.getSizeFromValue.mockReturnValue(5);
        variableSizeMock.write.mockImplementation((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('7777777777'), offset);
            return offset + 5;
        });
        variableSizeMock.read.mockReturnValue(['Hello', 6]);
        expect(option(variableSizeMock).encode(some('Hello'))).toStrictEqual(b('017777777777'));
        expect(variableSizeMock.write).toHaveBeenCalledWith('Hello', expect.any(Uint8Array), 1);
        expect(option(variableSizeMock).encode('Hello')).toStrictEqual(b('017777777777'));
        expect(variableSizeMock.write).toHaveBeenCalledWith('Hello', expect.any(Uint8Array), 1);
        expect(option(variableSizeMock).read(b('017777777777'), 0)).toStrictEqual([some('Hello'), 6]);
        expect(variableSizeMock.read).toHaveBeenCalledWith(b('017777777777'), 1);

        // Different From and To types.
        const optionU64 = option<bigint | number, bigint>(u64());
        expect(optionU64.encode(some(2))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(some(2n))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.read(b('010200000000000000'), 0)).toStrictEqual([some(2n), 9]);

        // Nested options.
        const nested = option(option(u8()));
        expect(nested.encode(some(some(42)))).toStrictEqual(b('01012a'));
        expect(nested.encode(some(42))).toStrictEqual(b('01012a'));
        expect(nested.encode(42)).toStrictEqual(b('01012a'));
        expect(nested.read(b('01012a'), 0)).toStrictEqual([some(some(42)), 3]);
        expect(nested.encode(some(none()))).toStrictEqual(b('0100'));
        expect(nested.encode(some(null))).toStrictEqual(b('0100'));
        expect(nested.read(b('0100'), 0)).toStrictEqual([some(none()), 2]);
        expect(nested.encode(none())).toStrictEqual(b('00'));
        expect(nested.encode(null)).toStrictEqual(b('00'));
        expect(nested.read(b('00'), 0)).toStrictEqual([none(), 1]);
    });

    it('encodes fixed options', () => {
        const fixedU8 = option(u8(), { fixed: true });
        const fixedU8WithU16Prefix = option(u8(), { fixed: true, prefix: u16() });

        // None.
        expect(fixedU8.encode(none())).toStrictEqual(b('0000'));
        expect(fixedU8.encode(null)).toStrictEqual(b('0000'));
        expect(fixedU8.read(b('0000'), 0)).toStrictEqual([none(), 2]);
        expect(fixedU8.read(b('ffff0000'), 2)).toStrictEqual([none(), 4]);

        // None with custom prefix.
        expect(fixedU8WithU16Prefix.encode(none())).toStrictEqual(b('000000'));
        expect(fixedU8WithU16Prefix.encode(null)).toStrictEqual(b('000000'));
        expect(fixedU8WithU16Prefix.read(b('000000'), 0)).toStrictEqual([none(), 3]);

        // Some.
        expect(fixedU8.encode(some(42))).toStrictEqual(b('012a'));
        expect(fixedU8.encode(42)).toStrictEqual(b('012a'));
        expect(fixedU8.read(b('012a'), 0)).toStrictEqual([some(42), 2]);
        expect(fixedU8.read(b('ffff012a'), 2)).toStrictEqual([some(42), 4]);

        // Some with custom prefix.
        expect(fixedU8WithU16Prefix.encode(42)).toStrictEqual(b('01002a'));
        expect(fixedU8WithU16Prefix.read(b('01002a'), 0)).toStrictEqual([some(42), 3]);

        // Different From and To types.
        const optionU64 = option<bigint | number, bigint>(u64());
        expect(optionU64.encode(some(2))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(some(2n))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.read(b('010200000000000000'), 0)).toStrictEqual([some(2n), 9]);

        // Fixed options must wrap fixed-size items.
        // @ts-expect-error Fixed options must wrap fixed-size items.
        expect(() => option(getMockCodec({ size: null }), { fixed: true })).toThrow(); // `SolanaError` added in later commit.
        // 'Fixed options can only be used with fixed-size codecs',
    });

    it('has the right sizes', () => {
        expect(option(u8()).getSizeFromValue(some(42))).toBe(1 + 1);
        expect(option(u8()).maxSize).toBe(2);
        expect(option(base16).getSizeFromValue(some('010203'))).toBe(1 + 3);
        expect(option(base16).maxSize).toBeUndefined();
        expect(option(u8(), { prefix: u16() }).getSizeFromValue(some(42))).toBe(2 + 1);
        expect(option(u8(), { prefix: u16() }).maxSize).toBe(3);

        // Fixed.
        expect(option(u8(), { fixed: true }).fixedSize).toBe(2);
        expect(option(u64(), { fixed: true }).fixedSize).toBe(9);
        expect(option(u8(), { fixed: true, prefix: u16() }).fixedSize).toBe(3);

        // Zero-size items.
        expect(option(unit()).fixedSize).toBe(1);
    });
});
