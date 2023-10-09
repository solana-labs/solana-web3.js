import { getU8Codec, getU16Codec, getU64Codec } from '@solana/codecs-numbers';

import { none, some } from '../option';
import { getOptionCodec } from '../option-codec';
import { b, getMockCodec } from './__setup__';

describe('getOptionCodec', () => {
    const option = getOptionCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const u64 = getU64Codec;

    it('encodes options', () => {
        // None.
        expect(option(u8()).encode(none())).toStrictEqual(b('00'));
        expect(option(u8()).encode(null)).toStrictEqual(b('00'));
        expect(option(u8()).decode(b('00'))).toStrictEqual([none(), 1]);
        expect(option(u8()).decode(b('ffff00'), 2)).toStrictEqual([none(), 3]);

        // None with custom prefix.
        expect(option(u8(), { prefix: u16() }).encode(none())).toStrictEqual(b('0000'));
        expect(option(u8(), { prefix: u16() }).encode(null)).toStrictEqual(b('0000'));
        expect(option(u8(), { prefix: u16() }).decode(b('0000'))).toStrictEqual([none(), 2]);

        // Some.
        expect(option(u8()).encode(some(42))).toStrictEqual(b('012a'));
        expect(option(u8()).encode(42)).toStrictEqual(b('012a'));
        expect(option(u8()).decode(b('012a'))).toStrictEqual([some(42), 2]);
        expect(option(u8()).decode(b('ffff012a'), 2)).toStrictEqual([some(42), 4]);

        // Some with custom prefix.
        expect(option(u8(), { prefix: u16() }).encode(some(42))).toStrictEqual(b('01002a'));
        expect(option(u8(), { prefix: u16() }).encode(42)).toStrictEqual(b('01002a'));
        expect(option(u8(), { prefix: u16() }).decode(b('01002a'))).toStrictEqual([some(42), 3]);

        // Some with variable-size codec.
        const variableSizeMock = getMockCodec({ size: null });
        variableSizeMock.encode.mockReturnValue(b('7777777777'));
        variableSizeMock.decode.mockReturnValue(['Hello', 6]);
        expect(option(variableSizeMock).encode(some('Hello'))).toStrictEqual(b('017777777777'));
        expect(variableSizeMock.encode).toHaveBeenCalledWith('Hello');
        expect(option(variableSizeMock).encode('Hello')).toStrictEqual(b('017777777777'));
        expect(variableSizeMock.encode).toHaveBeenCalledWith('Hello');
        expect(option(variableSizeMock).decode(b('017777777777'))).toStrictEqual([some('Hello'), 6]);
        expect(variableSizeMock.decode).toHaveBeenCalledWith(b('017777777777'), 1);

        // Different From and To types.
        const optionU64 = option<number | bigint, bigint>(u64());
        expect(optionU64.encode(some(2))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(some(2n))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.decode(b('010200000000000000'))).toStrictEqual([some(2n), 9]);

        // Nested options.
        const nested = option(option(u8()));
        expect(nested.encode(some(some(42)))).toStrictEqual(b('01012a'));
        expect(nested.encode(some(42))).toStrictEqual(b('01012a'));
        expect(nested.encode(42)).toStrictEqual(b('01012a'));
        expect(nested.decode(b('01012a'))).toStrictEqual([some(some(42)), 3]);
        expect(nested.encode(some(none()))).toStrictEqual(b('0100'));
        expect(nested.encode(some(null))).toStrictEqual(b('0100'));
        expect(nested.decode(b('0100'))).toStrictEqual([some(none()), 2]);
        expect(nested.encode(none())).toStrictEqual(b('00'));
        expect(nested.encode(null)).toStrictEqual(b('00'));
        expect(nested.decode(b('00'))).toStrictEqual([none(), 1]);
    });

    it('encodes fixed options', () => {
        const fixedU8 = option(u8(), { fixed: true });
        const fixedU8WithU16Prefix = option(u8(), { fixed: true, prefix: u16() });

        // None.
        expect(fixedU8.encode(none())).toStrictEqual(b('0000'));
        expect(fixedU8.encode(null)).toStrictEqual(b('0000'));
        expect(fixedU8.decode(b('0000'))).toStrictEqual([none(), 2]);
        expect(fixedU8.decode(b('ffff0000'), 2)).toStrictEqual([none(), 4]);

        // None with custom prefix.
        expect(fixedU8WithU16Prefix.encode(none())).toStrictEqual(b('000000'));
        expect(fixedU8WithU16Prefix.encode(null)).toStrictEqual(b('000000'));
        expect(fixedU8WithU16Prefix.decode(b('000000'))).toStrictEqual([none(), 3]);

        // Some.
        expect(fixedU8.encode(some(42))).toStrictEqual(b('012a'));
        expect(fixedU8.encode(42)).toStrictEqual(b('012a'));
        expect(fixedU8.decode(b('012a'))).toStrictEqual([some(42), 2]);
        expect(fixedU8.decode(b('ffff012a'), 2)).toStrictEqual([some(42), 4]);

        // Some with custom prefix.
        expect(fixedU8WithU16Prefix.encode(42)).toStrictEqual(b('01002a'));
        expect(fixedU8WithU16Prefix.decode(b('01002a'))).toStrictEqual([some(42), 3]);

        // Different From and To types.
        const optionU64 = option<number | bigint, bigint>(u64());
        expect(optionU64.encode(some(2))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(some(2n))).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.encode(2n)).toStrictEqual(b('010200000000000000'));
        expect(optionU64.decode(b('010200000000000000'))).toStrictEqual([some(2n), 9]);

        // Fixed options must wrap fixed-size items.
        expect(() => option(getMockCodec({ size: null }), { fixed: true })).toThrow(
            'Fixed options can only be used with fixed-size codecs'
        );
    });

    it('has the right description', () => {
        const mock = getMockCodec({ description: 'mock', size: 5 });
        expect(option(u8()).description).toBe('option(u8; u8)');
        expect(option(mock).description).toBe('option(mock; u8)');
        expect(option(u8(), { prefix: u16() }).description).toBe('option(u8; u16(le))');

        // Fixed.
        expect(option(u8(), { fixed: true }).description).toBe('option(u8; u8; fixed)');
        expect(option(mock, { fixed: true }).description).toBe('option(mock; u8; fixed)');
        expect(option(u8(), { fixed: true, prefix: u16() }).description).toBe('option(u8; u16(le); fixed)');

        // Custom description.
        expect(option(u8(), { description: 'My option' }).description).toBe('My option');
    });

    it('has the right sizes', () => {
        const fixMock = getMockCodec({ description: 'mock', size: 5 });
        const variableMock = getMockCodec({ description: 'mock', size: null });

        expect(option(u8()).fixedSize).toBeNull();
        expect(option(u8()).maxSize).toBe(2);
        expect(option(variableMock).fixedSize).toBeNull();
        expect(option(variableMock).maxSize).toBeNull();
        expect(option(u8(), { prefix: u16() }).fixedSize).toBeNull();
        expect(option(u8(), { prefix: u16() }).maxSize).toBe(3);

        // Fixed.
        expect(option(u8(), { fixed: true }).fixedSize).toBe(2);
        expect(option(u8(), { fixed: true }).maxSize).toBe(2);
        expect(option(fixMock, { fixed: true }).fixedSize).toBe(6);
        expect(option(fixMock, { fixed: true }).maxSize).toBe(6);
        expect(option(u8(), { fixed: true, prefix: u16() }).fixedSize).toBe(3);
        expect(option(u8(), { fixed: true, prefix: u16() }).maxSize).toBe(3);
    });
});
