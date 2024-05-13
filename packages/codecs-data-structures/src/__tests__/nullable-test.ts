import { getShortU16Codec, getU8Codec, getU16Codec, getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH, SolanaError } from '@solana/errors';

import { getNullableCodec } from '../nullable';
import { b } from './__setup__';

describe('getNullableCodec', () => {
    describe('with prefix', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec());
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('00'));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec());
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('00'))).toBeNull();
        });

        it('encodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: getU8Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('00'));
        });

        it('decodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: getU8Codec() });
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('00'))).toBeNull();
        });

        it('encodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: getU32Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000000000'));
            expect(codec.encode(42)).toStrictEqual(b('010000002a00'));
            expect(codec.encode(null)).toStrictEqual(b('00000000'));
        });

        it('decodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: getU32Codec() });
            expect(codec.decode(b('010000000000'))).toBe(0);
            expect(codec.decode(b('010000002a00'))).toBe(42);
            expect(codec.decode(b('00000000'))).toBeNull();
        });

        it('encodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec());
            expect(codec.encode('Hello')).toStrictEqual(b('0148656c6c6f'));
            expect(codec.encode(null)).toStrictEqual(b('00'));
        });

        it('decodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec());
            expect(codec.decode(b('0148656c6c6f'))).toBe('Hello');
            expect(codec.decode(b('00'))).toBeNull();
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec());
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(6);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(4);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec());
            expect(codec.read(b('ffff01010100'), 2)).toStrictEqual([257, 5]);
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([null, 3]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec());
            expect(codec.encode(2)).toStrictEqual(b('010200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('010200000000000000'));
            expect(codec.decode(b('010200000000000000'))).toBe(2n);
        });

        it('returns a variable size codec with max size', () => {
            const codec = getNullableCodec(getU16Codec());
            expect(codec.getSizeFromValue(null)).toBe(1);
            expect(codec.getSizeFromValue(42)).toBe(3);
            expect(codec.maxSize).toBe(3);
        });
    });

    describe('with zeroable none value', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.encode(42)).toStrictEqual(b('2a00'));
            expect(codec.encode(null)).toStrictEqual(b('0000'));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.decode(b('2a00'))).toBe(42);
            expect(codec.decode(b('0000'))).toBeNull();
        });

        it('can end up encoding the none value', () => {
            // ...because the item codec could use offsets to update the bytes in different ways.
            // Therefore checking that the encoded value is the same as the none value is not enough.
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.encode(0)).toStrictEqual(b('0000'));
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(5);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(5);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.read(b('ffff010100'), 2)).toStrictEqual([257, 4]);
            expect(codec.read(b('ffff000000'), 2)).toStrictEqual([null, 4]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.encode(2)).toStrictEqual(b('0200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('0200000000000000'));
            expect(codec.decode(b('0200000000000000'))).toBe(2n);
        });

        it('returns a fixed size codec', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: null });
            expect(codec.fixedSize).toBe(2);
        });

        it('fails if the items is not fixed', () => {
            // @ts-expect-error It cannot wrap a variable size item when fixed is true.
            expect(() => getNullableCodec(getUtf8Codec(), { noneValue: 'zeroes', prefix: null })).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH),
            );
        });
    });

    describe('with custom none value', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.encode(42)).toStrictEqual(b('2a00'));
            expect(codec.encode(null)).toStrictEqual(b('ffff'));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.decode(b('2a00'))).toBe(42);
            expect(codec.decode(b('ffff'))).toBeNull();
        });

        it('can end up encoding the none value', () => {
            // ...because the item codec could use offsets to update the bytes in different ways.
            // Therefore checking that the encoded value is the same as the none value is not enough.
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.encode(65535)).toStrictEqual(b('ffff'));
        });

        it('encodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.encode('Hello')).toStrictEqual(b('48656c6c6f'));
            expect(codec.encode(null)).toStrictEqual(b('ffff'));
        });

        it('decodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.decode(b('48656c6c6f'))).toBe('Hello');
            expect(codec.decode(b('ffff'))).toBeNull();
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(5);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(5);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('aaaa'), prefix: null });
            expect(codec.read(b('ffff010100'), 2)).toStrictEqual([257, 4]);
            expect(codec.read(b('ffffaaaa00'), 2)).toStrictEqual([null, 4]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec(), { noneValue: b('ffff'), prefix: null });
            expect(codec.encode(2)).toStrictEqual(b('0200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('0200000000000000'));
            expect(codec.decode(b('0200000000000000'))).toBe(2n);
        });

        it('returns a variable size codec', () => {
            // ...because the item and the none value do not need to have the same length.
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffffffff'), prefix: null });
            expect(codec.getSizeFromValue(null)).toBe(4);
            expect(codec.getSizeFromValue(42)).toBe(2);
            expect(codec.maxSize).toBe(4);
        });
    });

    describe('with prefix and zeroable none value', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes' });
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('000000'));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes' });
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('000000'))).toBeNull();
        });

        it('encodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: getU8Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('000000'));
        });

        it('decodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: getU8Codec() });
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('000000'))).toBeNull();
        });

        it('encodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: getU32Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000000000'));
            expect(codec.encode(42)).toStrictEqual(b('010000002a00'));
            expect(codec.encode(null)).toStrictEqual(b('000000000000'));
        });

        it('decodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: getU32Codec() });
            expect(codec.decode(b('010000000000'))).toBe(0);
            expect(codec.decode(b('010000002a00'))).toBe(42);
            expect(codec.decode(b('000000000000'))).toBeNull();
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes' });
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(6);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(6);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes' });
            expect(codec.read(b('ffff01010100'), 2)).toStrictEqual([257, 5]);
            expect(codec.read(b('ffff00000000'), 2)).toStrictEqual([null, 5]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec(), { noneValue: 'zeroes' });
            expect(codec.encode(2)).toStrictEqual(b('010200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('010200000000000000'));
            expect(codec.decode(b('010200000000000000'))).toBe(2n);
        });

        it('returns a fixed size codec if the prefix is fixed', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes' });
            expect(codec.fixedSize).toBe(3);
        });

        it('returns a variable size codec if the prefix is variable', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: 'zeroes', prefix: getShortU16Codec() });
            expect(codec.getSizeFromValue(null)).toBe(3);
            expect(codec.getSizeFromValue(42)).toBe(3);
            expect(codec.maxSize).toBe(5);
        });

        it('fails if the items is not fixed', () => {
            // @ts-expect-error It cannot wrap a variable size item when fixed is true.
            expect(() => getNullableCodec(getUtf8Codec(), { noneValue: 'zeroes' })).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH),
            );
        });
    });

    describe('with prefix and custom none value', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff') });
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('00ffff'));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff') });
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('00ffff'))).toBeNull();
        });

        it('encodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: getU8Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000'));
            expect(codec.encode(42)).toStrictEqual(b('012a00'));
            expect(codec.encode(null)).toStrictEqual(b('00ffff'));
        });

        it('decodes nullable numbers with explicit prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: getU8Codec() });
            expect(codec.decode(b('010000'))).toBe(0);
            expect(codec.decode(b('012a00'))).toBe(42);
            expect(codec.decode(b('00ffff'))).toBeNull();
        });

        it('encodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: getU32Codec() });
            expect(codec.encode(0)).toStrictEqual(b('010000000000'));
            expect(codec.encode(42)).toStrictEqual(b('010000002a00'));
            expect(codec.encode(null)).toStrictEqual(b('00000000ffff'));
        });

        it('decodes nullable numbers with custom prefix', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff'), prefix: getU32Codec() });
            expect(codec.decode(b('010000000000'))).toBe(0);
            expect(codec.decode(b('010000002a00'))).toBe(42);
            expect(codec.decode(b('00000000ffff'))).toBeNull();
        });

        it('encodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { noneValue: b('ffff') });
            expect(codec.encode('Hello')).toStrictEqual(b('0148656c6c6f'));
            expect(codec.encode(null)).toStrictEqual(b('00ffff'));
        });

        it('decodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { noneValue: b('ffff') });
            expect(codec.decode(b('0148656c6c6f'))).toBe('Hello');
            expect(codec.decode(b('00ffff'))).toBeNull();
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffff') });
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(6);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(6);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('aaaa') });
            expect(codec.read(b('ffff01010100'), 2)).toStrictEqual([257, 5]);
            expect(codec.read(b('ffff00aaaa00'), 2)).toStrictEqual([null, 5]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec(), { noneValue: b('ffff') });
            expect(codec.encode(2)).toStrictEqual(b('010200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('010200000000000000'));
            expect(codec.decode(b('010200000000000000'))).toBe(2n);
        });

        it('returns a variable size codec', () => {
            // ...because the item and the none value do not need to have the same length.
            const codec = getNullableCodec(getU16Codec(), { noneValue: b('ffffffff') });
            expect(codec.getSizeFromValue(null)).toBe(5);
            expect(codec.getSizeFromValue(42)).toBe(3);
            expect(codec.maxSize).toBe(5);
        });
    });

    describe('with no prefix nor none value', () => {
        it('encodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: null });
            expect(codec.encode(42)).toStrictEqual(b('2a00'));
            expect(codec.encode(null)).toStrictEqual(b(''));
        });

        it('decodes nullable numbers', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: null });
            expect(codec.decode(b('2a00'))).toBe(42);
            expect(codec.decode(b(''))).toBeNull();
        });

        it('encodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { prefix: null });
            expect(codec.encode('Hello')).toStrictEqual(b('48656c6c6f'));
            expect(codec.encode(null)).toStrictEqual(b(''));
        });

        it('decodes nullable variable strings', () => {
            const codec = getNullableCodec(getUtf8Codec(), { prefix: null });
            expect(codec.decode(b('48656c6c6f'))).toBe('Hello');
            expect(codec.decode(b(''))).toBeNull();
        });

        it('pushes the offset forward when writing', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: null });
            expect(codec.write(257, new Uint8Array(10), 3)).toBe(5);
            expect(codec.write(null, new Uint8Array(10), 3)).toBe(3);
        });

        it('pushes the offset forward when reading', () => {
            const codec = getNullableCodec(getU16Codec(), { prefix: null });
            expect(codec.read(b('ffff010100'), 2)).toStrictEqual([257, 4]);
            expect(codec.read(b('ffff'), 2)).toStrictEqual([null, 2]);
        });

        it('encodes and decodes different from and to types', () => {
            const codec = getNullableCodec(getU64Codec(), { prefix: null });
            expect(codec.encode(2)).toStrictEqual(b('0200000000000000'));
            expect(codec.encode(2n)).toStrictEqual(b('0200000000000000'));
            expect(codec.decode(b('0200000000000000'))).toBe(2n);
        });

        it('returns a variable size codec', () => {
            // ...because the item and the none value do not need to have the same length.
            const codec = getNullableCodec(getU16Codec(), { prefix: null });
            expect(codec.getSizeFromValue(null)).toBe(0);
            expect(codec.getSizeFromValue(42)).toBe(2);
            expect(codec.maxSize).toBe(2);
        });
    });
});
