import { assertIsFixedSize, assertIsVariableSize, fixCodecSize, transformCodec } from '@solana/codecs-core';
import { getU8Codec, getU16Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import { getBooleanCodec } from '../boolean';
import { getStructCodec } from '../struct';
import { getUnionCodec } from '../union';
import { b } from './__setup__';

describe('getUnionCodec', () => {
    const codec = getUnionCodec(
        [
            fixCodecSize(getUtf8Codec(), 8), // 8 bytes.
            getU16Codec(), // 2 bytes.
            getBooleanCodec(), // 1 byte.
            getStructCodec([
                // 4 bytes.
                ['x', getU16Codec()],
                ['y', getU16Codec()],
            ]),
        ],
        value => {
            if (value === 999) return 999;
            if (typeof value === 'string') return 0;
            if (typeof value === 'number') return 1;
            if (typeof value === 'boolean') return 2;
            return 3;
        },
        bytes => {
            if (bytes.length === 3 && [...bytes].every(byte => byte === 255)) return 999;
            if (bytes.length === 8) return 0;
            if (bytes.length === 2) return 1;
            if (bytes.length === 1) return 2;
            return 3;
        },
    );

    it('encodes any valid union variant', () => {
        expect(codec.encode('hello')).toStrictEqual(b('68656c6c6f000000'));
        expect(codec.encode(42)).toStrictEqual(b('2a00'));
        expect(codec.encode(true)).toStrictEqual(b('01'));
        expect(codec.encode({ x: 1, y: 2 })).toStrictEqual(b('01000200'));
    });

    it('decodes any valid union variant', () => {
        expect(codec.decode(b('68656c6c6f000000'))).toBe('hello');
        expect(codec.decode(b('2a00'))).toBe(42);
        expect(codec.decode(b('01'))).toBe(true);
        expect(codec.decode(b('01000200'))).toStrictEqual({ x: 1, y: 2 });
    });

    it('pushes the offset forward when writing', () => {
        expect(codec.write(42, new Uint8Array(10), 6)).toBe(8);
    });

    it('pushes the offset forward when reading', () => {
        expect(codec.read(b('00'), 0)).toStrictEqual([false, 1]);
    });

    it('throws when encoding an invalid variant', () => {
        expect(() => codec.encode(999)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, {
                maxRange: 3,
                minRange: 0,
                variant: 999,
            }),
        );
    });

    it('throws when decoding an invalid variant', () => {
        expect(() => codec.decode(b('ffffff'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__UNION_VARIANT_OUT_OF_RANGE, {
                maxRange: 3,
                minRange: 0,
                variant: 999,
            }),
        );
    });

    it('returns a variable size codec', () => {
        assertIsVariableSize(codec);
        expect(codec.getSizeFromValue('hello')).toBe(8);
        expect(codec.getSizeFromValue(42)).toBe(2);
        expect(codec.getSizeFromValue(true)).toBe(1);
        expect(codec.getSizeFromValue({ x: 1, y: 2 })).toBe(4);
        expect(codec.maxSize).toBe(8);
    });

    it('returns a fixed size codec when all variants have the same fixed size', () => {
        const sameSizeCodec = getUnionCodec(
            [getU8Codec(), getBooleanCodec()],
            () => 0,
            () => 0,
        );
        assertIsFixedSize(sameSizeCodec);
        expect(sameSizeCodec.fixedSize).toBe(1);
    });

    it('can be used to create a zeroable nullable codec', () => {
        const nullCodec = transformCodec(
            getU8Codec(),
            (_value: null) => 0xff,
            () => null,
        );
        const zeroableCodec = getUnionCodec(
            [nullCodec, getU8Codec()],
            value => Number(value !== null),
            (bytes, offset) => Number(bytes[offset] !== 0xff),
        );
        expect(zeroableCodec.encode(null)).toStrictEqual(b('ff'));
        expect(zeroableCodec.encode(42)).toStrictEqual(b('2a'));
        expect(zeroableCodec.decode(b('ff'))).toBeNull();
        expect(zeroableCodec.decode(b('2a'))).toBe(42);
    });

    it('can be used to create a discriminated union codec', () => {
        const staticU16One = transformCodec(
            getU16Codec(),
            (_value: 1) => 1,
            () => 1 as const,
        );
        const staticU16Two = transformCodec(
            getU16Codec(),
            (_value: 2) => 2,
            () => 2 as const,
        );
        const discriminatedUnionCodec = getUnionCodec(
            [
                getStructCodec([
                    ['header', getU16Codec()],
                    ['type', staticU16One],
                ]),
                getStructCodec([
                    ['size', getU16Codec()],
                    ['type', staticU16Two],
                ]),
            ],
            value => value.type - 1,
            (bytes, offset) => bytes[offset + 2] - 1,
        );
        expect(discriminatedUnionCodec.encode({ header: 42, type: 1 })).toStrictEqual(b('2a000100'));
        expect(discriminatedUnionCodec.encode({ size: 9, type: 2 })).toStrictEqual(b('09000200'));
        expect(discriminatedUnionCodec.decode(b('2a000100'))).toStrictEqual({ header: 42, type: 1 });
        expect(discriminatedUnionCodec.decode(b('09000200'))).toStrictEqual({ size: 9, type: 2 });
    });
});
