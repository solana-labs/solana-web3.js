import { getU32Codec } from '@solana/codecs-numbers';

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
        expect(boolean().read(b('01'), 0)).toStrictEqual([true, 1]);
        expect(boolean().read(b('00'), 0)).toStrictEqual([false, 1]);
        expect(boolean().read(b('ffff01'), 2)).toStrictEqual([true, 3]);
        expect(boolean().read(b('ffff00'), 2)).toStrictEqual([false, 3]);
        expect(boolean({ size: u32() }).read(b('01000000'), 0)).toStrictEqual([true, 4]);
        expect(boolean({ size: u32() }).read(b('00000000'), 0)).toStrictEqual([false, 4]);
    });

    it('has the right sizes', () => {
        expect(boolean().fixedSize).toBe(1);
        expect(boolean({ size: u32() }).fixedSize).toBe(4);
    });
});
