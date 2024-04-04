import { transformCodec } from '@solana/codecs-core';
import { getShortU16Codec, getU32Codec } from '@solana/codecs-numbers';

import { getBooleanCodec } from '../boolean';
import { b } from './__setup__';

describe('getBooleanCodec', () => {
    // A variable-size number codecs that uses 0 for `false`
    // and the max shortU16 value for `true`.
    const mappedShortU16 = transformCodec(
        getShortU16Codec(),
        // eslint-disable-next-line jest/no-conditional-in-test
        v => (v === 0 ? 0 : 0xffff),
        // eslint-disable-next-line jest/no-conditional-in-test
        v => (v === 0 ? 0 : 1),
    );

    it('encodes booleans using a u8 number', () => {
        expect(getBooleanCodec().encode(true)).toStrictEqual(b('01'));
        expect(getBooleanCodec().encode(false)).toStrictEqual(b('00'));
    });

    it('decodes booleans using a u8 number', () => {
        expect(getBooleanCodec().decode(b('01'))).toBe(true);
        expect(getBooleanCodec().decode(b('00'))).toBe(false);
    });

    it('encodes booleans using a custom fixed-size number codec', () => {
        const codec = getBooleanCodec({ size: getU32Codec() });
        expect(codec.encode(true)).toStrictEqual(b('01000000'));
        expect(codec.encode(false)).toStrictEqual(b('00000000'));
    });

    it('decodes booleans using a custom fixed-size number codec', () => {
        const codec = getBooleanCodec({ size: getU32Codec() });
        expect(codec.decode(b('01000000'))).toBe(true);
        expect(codec.decode(b('00000000'))).toBe(false);
    });

    it('encodes booleans using a custom variable-size number codec', () => {
        const codec = getBooleanCodec({ size: mappedShortU16 });
        expect(codec.encode(true)).toStrictEqual(b('ffff03'));
        expect(codec.encode(false)).toStrictEqual(b('00'));
    });

    it('decodes booleans using a custom variable-size number codec', () => {
        const codec = getBooleanCodec({ size: mappedShortU16 });
        expect(codec.decode(b('ffff03'))).toBe(true);
        expect(codec.decode(b('00'))).toBe(false);
    });

    it('pushes the offset forward when writing', () => {
        expect(getBooleanCodec().write(true, new Uint8Array(10), 6)).toBe(7);
    });

    it('pushes the offset forward when reading', () => {
        expect(getBooleanCodec().read(b('ffff00'), 2)).toStrictEqual([false, 3]);
    });

    it('pushes the offset forward when writing using a custom size', () => {
        expect(getBooleanCodec({ size: getU32Codec() }).write(true, new Uint8Array(10), 3)).toBe(7);
    });

    it('pushes the offset forward when reading using a custom size', () => {
        expect(getBooleanCodec({ size: getU32Codec() }).read(b('ffff00000000'), 2)).toStrictEqual([false, 6]);
    });

    it('returns the correct default fixed size', () => {
        const codec = getBooleanCodec();
        expect(codec.fixedSize).toBe(1);
    });

    it('returns the correct custom fixed size', () => {
        const codec = getBooleanCodec({ size: getU32Codec() });
        expect(codec.fixedSize).toBe(4);
    });

    it('returns the correct custom variable size', () => {
        const codec = getBooleanCodec({ size: mappedShortU16 });
        expect(codec.getSizeFromValue(false)).toBe(1);
        expect(codec.getSizeFromValue(true)).toBe(3);
        expect(codec.maxSize).toBe(3);
    });
});
