import { Endian, getU32Codec } from '@solana/codecs-numbers';

import { getBooleanCodec } from '../boolean';
import { b } from './__setup__';

describe('getBooleanCodec', () => {
    const boolean = getBooleanCodec;
    const u32 = getU32Codec;

    it('encodes booleans', () => {
        // Encode.
        expect(boolean().encode(true)).toStrictEqual(b('01'));
        expect(boolean().encode(false)).toStrictEqual(b('00'));
        expect(boolean({ size: u32() }).encode(true)).toStrictEqual(b('01000000'));
        expect(boolean({ size: u32() }).encode(false)).toStrictEqual(b('00000000'));

        // Decode.
        expect(boolean().decode(b('01'))).toStrictEqual([true, 1]);
        expect(boolean().decode(b('00'))).toStrictEqual([false, 1]);
        expect(boolean().decode(b('ffff01'), 2)).toStrictEqual([true, 3]);
        expect(boolean().decode(b('ffff00'), 2)).toStrictEqual([false, 3]);
        expect(boolean({ size: u32() }).decode(b('01000000'))).toStrictEqual([true, 4]);
        expect(boolean({ size: u32() }).decode(b('00000000'))).toStrictEqual([false, 4]);
    });

    it('has the right description', () => {
        expect(boolean().description).toBe('bool(u8)');
        expect(boolean({ size: u32() }).description).toBe('bool(u32(le))');
        expect(boolean({ size: u32({ endian: Endian.BIG }) }).description).toBe('bool(u32(be))');
        expect(boolean({ description: 'My bool' }).description).toBe('My bool');
    });

    it('has the right sizes', () => {
        expect(boolean().fixedSize).toBe(1);
        expect(boolean().maxSize).toBe(1);
        expect(boolean({ size: u32() }).fixedSize).toBe(4);
        expect(boolean({ size: u32() }).maxSize).toBe(4);
    });
});
