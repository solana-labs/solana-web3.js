import { assertIsFixedSize, assertIsVariableSize } from '@solana/codecs-core';
import { getShortU16Codec, getU32Codec } from '@solana/codecs-numbers';
import {
    SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT,
    SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { getLiteralUnionCodec } from '../literal-union';
import { b } from './__setup__';

describe('getLiteralUnionCodec', () => {
    it('encodes string unions', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C']);
        expect(codec.encode('A')).toStrictEqual(b('00'));
        expect(codec.encode('B')).toStrictEqual(b('01'));
        expect(codec.encode('C')).toStrictEqual(b('02'));
    });

    it('decodes string unions', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C']);
        expect(codec.decode(b('00'))).toBe('A');
        expect(codec.decode(b('01'))).toBe('B');
        expect(codec.decode(b('02'))).toBe('C');
    });

    it('encodes number and bigint unions', () => {
        const codec = getLiteralUnionCodec([1, 2n, 3]);
        expect(codec.encode(1)).toStrictEqual(b('00'));
        expect(codec.encode(2n)).toStrictEqual(b('01'));
        expect(codec.encode(3)).toStrictEqual(b('02'));
    });

    it('decodes number and bigint unions', () => {
        const codec = getLiteralUnionCodec([1, 2n, 3]);
        expect(codec.decode(b('00'))).toBe(1);
        expect(codec.decode(b('01'))).toBe(2n);
        expect(codec.decode(b('02'))).toBe(3);
    });

    it('encodes boolean unions', () => {
        const codec = getLiteralUnionCodec([true, false]);
        expect(codec.encode(true)).toStrictEqual(b('00'));
        expect(codec.encode(false)).toStrictEqual(b('01'));
    });

    it('decodes boolean unions', () => {
        const codec = getLiteralUnionCodec([true, false]);
        expect(codec.decode(b('00'))).toBe(true);
        expect(codec.decode(b('01'))).toBe(false);
    });

    it('encodes null and undefined unions', () => {
        const codec = getLiteralUnionCodec([null, undefined]);
        expect(codec.encode(null)).toStrictEqual(b('00'));
        expect(codec.encode(undefined)).toStrictEqual(b('01'));
    });

    it('decodes null and undefined unions', () => {
        const codec = getLiteralUnionCodec([null, undefined]);
        expect(codec.decode(b('00'))).toBeNull();
        expect(codec.decode(b('01'))).toBeUndefined();
    });

    it('pushes the offset forward when writing', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C']);
        expect(codec.write('A', new Uint8Array(10), 6)).toBe(7);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C']);
        expect(codec.read(b('ffff00'), 2)).toStrictEqual(['A', 3]);
    });

    it('encodes using a custom discriminator size', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C'], {
            size: getU32Codec(),
        });
        expect(codec.encode('A')).toStrictEqual(b('00000000'));
        expect(codec.encode('B')).toStrictEqual(b('01000000'));
        expect(codec.encode('C')).toStrictEqual(b('02000000'));
    });

    it('decodes using a custom discriminator size', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C'], {
            size: getU32Codec(),
        });
        expect(codec.decode(b('00000000'))).toBe('A');
        expect(codec.decode(b('01000000'))).toBe('B');
        expect(codec.decode(b('02000000'))).toBe('C');
    });

    it('throws when provided with an invalid variant', () => {
        const codec = getLiteralUnionCodec(['one', 2, 3n, false, null]);
        // @ts-expect-error Expected invalid variant.
        expect(() => codec.encode('missing')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_LITERAL_UNION_VARIANT, {
                value: 'missing',
                variants: ['one', 2, 3n, false, null],
            }),
        );
    });

    it('throws when provided with an invalid discriminator', () => {
        const codec = getLiteralUnionCodec(['one', 2, 3n, false, null]);
        expect(() => codec.decode(b('05'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__LITERAL_UNION_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 5,
                maxRange: 4,
                minRange: 0,
            }),
        );
    });

    it('returns the correct default fixed size', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C']);
        assertIsFixedSize(codec);
        expect(codec.fixedSize).toBe(1);
    });

    it('returns the correct custom fixed size', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C'], { size: getU32Codec() });
        assertIsFixedSize(codec);
        expect(codec.fixedSize).toBe(4);
    });

    it('returns the correct custom variable size', () => {
        const codec = getLiteralUnionCodec(['A', 'B', 'C'], { size: getShortU16Codec() });
        assertIsVariableSize(codec);
        expect(codec.getSizeFromValue('A')).toBe(1);
        expect(codec.maxSize).toBe(3);
    });
});
