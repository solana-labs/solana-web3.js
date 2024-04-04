import { getShortU16Codec, getU32Codec } from '@solana/codecs-numbers';
import {
    SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS,
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import { getEnumCodec } from '../enum';
import { b } from './__setup__';

describe('getEnumCodec', () => {
    describe('sequential numerical enums', () => {
        enum Feedback {
            Bad,
            Good,
        }
        const codec = getEnumCodec(Feedback);

        it('encodes enums by value', () => {
            expect(codec.encode(Feedback.Bad)).toStrictEqual(b('00'));
            expect(codec.encode(Feedback.Good)).toStrictEqual(b('01'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('Bad')).toStrictEqual(b('00'));
            expect(codec.encode('Good')).toStrictEqual(b('01'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Feedback.Bad);
            expect(codec.decode(b('01'))).toBe(Feedback.Good);
        });

        it('pushes the offset forward when writing', () => {
            expect(codec.write(Feedback.Bad, new Uint8Array(10), 6)).toBe(7);
        });

        it('pushes the offset forward when reading', () => {
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([Feedback.Bad, 3]);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => getEnumCodec(Feedback).encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '0-1',
                    numericalValues: [0, 1],
                    stringValues: ['Bad', 'Good'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('02'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 2,
                    formattedValidDiscriminators: '0-1',
                    validDiscriminators: [0, 1],
                }),
            );
        });

        it('encodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Feedback, { size: getU32Codec() });
            expect(u32Codec.encode(Feedback.Bad)).toStrictEqual(b('00000000'));
            expect(u32Codec.encode(Feedback.Good)).toStrictEqual(b('01000000'));
        });

        it('decodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Feedback, { size: getU32Codec() });
            expect(u32Codec.decode(b('00000000'))).toBe(Feedback.Bad);
            expect(u32Codec.decode(b('01000000'))).toBe(Feedback.Good);
        });

        it('returns the correct default fixed size', () => {
            expect(codec.fixedSize).toBe(1);
        });

        it('returns the correct custom fixed size', () => {
            const u32Codec = getEnumCodec(Feedback, { size: getU32Codec() });
            expect(u32Codec.fixedSize).toBe(4);
        });

        it('returns the correct custom variable size', () => {
            const u32Codec = getEnumCodec(Feedback, { size: getShortU16Codec() });
            expect(u32Codec.getSizeFromValue(Feedback.Bad)).toBe(1);
            expect(u32Codec.maxSize).toBe(3);
        });
    });

    describe('explicit numerical enums', () => {
        enum Numbers {
            Zero,
            Five = 5,
            Six,
            Nine = 9,
        }
        const codec = getEnumCodec(Numbers);

        it('encodes enums by value', () => {
            expect(codec.encode(Numbers.Zero)).toStrictEqual(b('00'));
            expect(codec.encode(Numbers.Five)).toStrictEqual(b('01'));
            expect(codec.encode(Numbers.Six)).toStrictEqual(b('02'));
            expect(codec.encode(Numbers.Nine)).toStrictEqual(b('03'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('Zero')).toStrictEqual(b('00'));
            expect(codec.encode('Five')).toStrictEqual(b('01'));
            expect(codec.encode('Six')).toStrictEqual(b('02'));
            expect(codec.encode('Nine')).toStrictEqual(b('03'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Numbers.Zero);
            expect(codec.decode(b('01'))).toBe(Numbers.Five);
            expect(codec.decode(b('02'))).toBe(Numbers.Six);
            expect(codec.decode(b('03'))).toBe(Numbers.Nine);
        });

        it('pushes the offset forward when writing', () => {
            expect(codec.write(Numbers.Zero, new Uint8Array(10), 6)).toBe(7);
        });

        it('pushes the offset forward when reading', () => {
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([Numbers.Zero, 3]);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => codec.encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '0, 5-6, 9',
                    numericalValues: [0, 5, 6, 9],
                    stringValues: ['Zero', 'Five', 'Six', 'Nine'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('04'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 4,
                    formattedValidDiscriminators: '0-3',
                    validDiscriminators: [0, 1, 2, 3],
                }),
            );
        });

        it('encodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec() });
            expect(u32Codec.encode(Numbers.Zero)).toStrictEqual(b('00000000'));
            expect(u32Codec.encode(Numbers.Five)).toStrictEqual(b('01000000'));
            expect(u32Codec.encode(Numbers.Six)).toStrictEqual(b('02000000'));
            expect(u32Codec.encode(Numbers.Nine)).toStrictEqual(b('03000000'));
        });

        it('decodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec() });
            expect(u32Codec.decode(b('00000000'))).toBe(Numbers.Zero);
            expect(u32Codec.decode(b('01000000'))).toBe(Numbers.Five);
            expect(u32Codec.decode(b('02000000'))).toBe(Numbers.Six);
            expect(u32Codec.decode(b('03000000'))).toBe(Numbers.Nine);
        });

        it('returns the correct default fixed size', () => {
            expect(codec.fixedSize).toBe(1);
        });

        it('returns the correct custom fixed size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec() });
            expect(u32Codec.fixedSize).toBe(4);
        });

        it('returns the correct custom variable size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getShortU16Codec() });
            expect(u32Codec.getSizeFromValue(Numbers.Zero)).toBe(1);
            expect(u32Codec.maxSize).toBe(3);
        });
    });

    describe('explicit numerical enums using values as discriminators', () => {
        enum Numbers {
            Zero,
            Five = 5,
            Six,
            Nine = 9,
        }
        const codec = getEnumCodec(Numbers, { useValuesAsDiscriminators: true });

        it('encodes enums by value', () => {
            expect(codec.encode(Numbers.Zero)).toStrictEqual(b('00'));
            expect(codec.encode(Numbers.Five)).toStrictEqual(b('05'));
            expect(codec.encode(Numbers.Six)).toStrictEqual(b('06'));
            expect(codec.encode(Numbers.Nine)).toStrictEqual(b('09'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('Zero')).toStrictEqual(b('00'));
            expect(codec.encode('Five')).toStrictEqual(b('05'));
            expect(codec.encode('Six')).toStrictEqual(b('06'));
            expect(codec.encode('Nine')).toStrictEqual(b('09'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Numbers.Zero);
            expect(codec.decode(b('05'))).toBe(Numbers.Five);
            expect(codec.decode(b('06'))).toBe(Numbers.Six);
            expect(codec.decode(b('09'))).toBe(Numbers.Nine);
        });

        it('pushes the offset forward when writing', () => {
            expect(codec.write(Numbers.Zero, new Uint8Array(10), 6)).toBe(7);
        });

        it('pushes the offset forward when reading', () => {
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([Numbers.Zero, 3]);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => codec.encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '0, 5-6, 9',
                    numericalValues: [0, 5, 6, 9],
                    stringValues: ['Zero', 'Five', 'Six', 'Nine'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('01'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 1,
                    formattedValidDiscriminators: '0, 5-6, 9',
                    validDiscriminators: [0, 5, 6, 9],
                }),
            );
        });

        it('encodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec(), useValuesAsDiscriminators: true });
            expect(u32Codec.encode(Numbers.Zero)).toStrictEqual(b('00000000'));
            expect(u32Codec.encode(Numbers.Five)).toStrictEqual(b('05000000'));
            expect(u32Codec.encode(Numbers.Six)).toStrictEqual(b('06000000'));
            expect(u32Codec.encode(Numbers.Nine)).toStrictEqual(b('09000000'));
        });

        it('decodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec(), useValuesAsDiscriminators: true });
            expect(u32Codec.decode(b('00000000'))).toBe(Numbers.Zero);
            expect(u32Codec.decode(b('05000000'))).toBe(Numbers.Five);
            expect(u32Codec.decode(b('06000000'))).toBe(Numbers.Six);
            expect(u32Codec.decode(b('09000000'))).toBe(Numbers.Nine);
        });

        it('returns the correct default fixed size', () => {
            expect(codec.fixedSize).toBe(1);
        });

        it('returns the correct custom fixed size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getU32Codec() });
            expect(u32Codec.fixedSize).toBe(4);
        });

        it('returns the correct custom variable size', () => {
            const u32Codec = getEnumCodec(Numbers, { size: getShortU16Codec() });
            expect(u32Codec.getSizeFromValue(Numbers.Zero)).toBe(1);
            expect(u32Codec.maxSize).toBe(3);
        });
    });

    describe('conflicting numerical enums', () => {
        enum Duplicates {
            A = 42,
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            B = 42,
        }
        const codec = getEnumCodec(Duplicates);

        it('uses the last index when encoding enums by value', () => {
            expect(codec.encode(Duplicates.A)).toStrictEqual(b('01'));
            expect(codec.encode(Duplicates.B)).toStrictEqual(b('01'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('A')).toStrictEqual(b('00'));
            expect(codec.encode('B')).toStrictEqual(b('01'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Duplicates.A);
            expect(codec.decode(b('01'))).toBe(Duplicates.B);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => codec.encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '42',
                    numericalValues: [42],
                    stringValues: ['A', 'B'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('02'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 2,
                    formattedValidDiscriminators: '0-1',
                    validDiscriminators: [0, 1],
                }),
            );
        });
    });

    describe('conflicting numerical enums using values as discriminators', () => {
        enum Duplicates {
            A = 42,
            // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
            B = 42,
        }
        const codec = getEnumCodec(Duplicates, { useValuesAsDiscriminators: true });

        it('encodes conflicting enum variants by value', () => {
            expect(codec.encode(Duplicates.A)).toStrictEqual(b('2a'));
            expect(codec.encode(Duplicates.B)).toStrictEqual(b('2a'));
        });

        it('encodes conflicting enum variants by key', () => {
            expect(codec.encode('A')).toStrictEqual(b('2a'));
            expect(codec.encode('B')).toStrictEqual(b('2a'));
        });

        it('uses the last variant when decoding conflicting variants', () => {
            expect(codec.decode(b('2a'))).toBe(Duplicates.B);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => codec.encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '42',
                    numericalValues: [42],
                    stringValues: ['A', 'B'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('01'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 1,
                    formattedValidDiscriminators: '42',
                    validDiscriminators: [42],
                }),
            );
        });
    });

    describe('lexical enums', () => {
        enum Direction {
            Up = '↑',
            Down = '↓',
            Left = '←',
            Right = '→',
        }
        const codec = getEnumCodec(Direction);

        it('encodes enums by value', () => {
            expect(codec.encode(Direction.Up)).toStrictEqual(b('00'));
            expect(codec.encode(Direction.Down)).toStrictEqual(b('01'));
            expect(codec.encode(Direction.Left)).toStrictEqual(b('02'));
            expect(codec.encode(Direction.Right)).toStrictEqual(b('03'));
            expect(codec.encode('↑' as Direction)).toStrictEqual(b('00'));
            expect(codec.encode('↓' as Direction)).toStrictEqual(b('01'));
            expect(codec.encode('←' as Direction)).toStrictEqual(b('02'));
            expect(codec.encode('→' as Direction)).toStrictEqual(b('03'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('Up')).toStrictEqual(b('00'));
            expect(codec.encode('Down')).toStrictEqual(b('01'));
            expect(codec.encode('Left')).toStrictEqual(b('02'));
            expect(codec.encode('Right')).toStrictEqual(b('03'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Direction.Up);
            expect(codec.decode(b('01'))).toBe(Direction.Down);
            expect(codec.decode(b('02'))).toBe(Direction.Left);
            expect(codec.decode(b('03'))).toBe(Direction.Right);
        });

        it('pushes the offset forward when writing', () => {
            expect(codec.write(Direction.Up, new Uint8Array(10), 6)).toBe(7);
        });

        it('pushes the offset forward when reading', () => {
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([Direction.Up, 3]);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => getEnumCodec(Direction).encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '',
                    numericalValues: [],
                    stringValues: ['Up', 'Down', 'Left', 'Right', '↑', '↓', '←', '→'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('04'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 4,
                    formattedValidDiscriminators: '0-3',
                    validDiscriminators: [0, 1, 2, 3],
                }),
            );
        });

        it('encodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Direction, { size: getU32Codec() });
            expect(u32Codec.encode(Direction.Up)).toStrictEqual(b('00000000'));
            expect(u32Codec.encode(Direction.Down)).toStrictEqual(b('01000000'));
            expect(u32Codec.encode(Direction.Left)).toStrictEqual(b('02000000'));
            expect(u32Codec.encode(Direction.Right)).toStrictEqual(b('03000000'));
        });

        it('decodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Direction, { size: getU32Codec() });
            expect(u32Codec.decode(b('00000000'))).toBe(Direction.Up);
            expect(u32Codec.decode(b('01000000'))).toBe(Direction.Down);
            expect(u32Codec.decode(b('02000000'))).toBe(Direction.Left);
            expect(u32Codec.decode(b('03000000'))).toBe(Direction.Right);
        });

        it('returns the correct default fixed size', () => {
            expect(codec.fixedSize).toBe(1);
        });

        it('returns the correct custom fixed size', () => {
            const u32Codec = getEnumCodec(Direction, { size: getU32Codec() });
            expect(u32Codec.fixedSize).toBe(4);
        });

        it('returns the correct custom variable size', () => {
            const u32Codec = getEnumCodec(Direction, { size: getShortU16Codec() });
            expect(u32Codec.getSizeFromValue(Direction.Up)).toBe(1);
            expect(u32Codec.maxSize).toBe(3);
        });
    });

    describe('hybrid enums', () => {
        enum Hybrid {
            Zero,
            Five = 5,
            Six,
            Seven = 'seven',
        }
        const codec = getEnumCodec(Hybrid);

        it('encodes enums by value', () => {
            expect(codec.encode(Hybrid.Zero)).toStrictEqual(b('00'));
            expect(codec.encode(Hybrid.Five)).toStrictEqual(b('01'));
            expect(codec.encode(Hybrid.Six)).toStrictEqual(b('02'));
            expect(codec.encode(Hybrid.Seven)).toStrictEqual(b('03'));
            expect(codec.encode(0 as Hybrid)).toStrictEqual(b('00'));
            expect(codec.encode(5 as Hybrid)).toStrictEqual(b('01'));
            expect(codec.encode(6 as Hybrid)).toStrictEqual(b('02'));
            expect(codec.encode('seven' as Hybrid)).toStrictEqual(b('03'));
        });

        it('encodes enums by key', () => {
            expect(codec.encode('Zero')).toStrictEqual(b('00'));
            expect(codec.encode('Five')).toStrictEqual(b('01'));
            expect(codec.encode('Six')).toStrictEqual(b('02'));
            expect(codec.encode('Seven')).toStrictEqual(b('03'));
        });

        it('decodes enum values', () => {
            expect(codec.decode(b('00'))).toBe(Hybrid.Zero);
            expect(codec.decode(b('01'))).toBe(Hybrid.Five);
            expect(codec.decode(b('02'))).toBe(Hybrid.Six);
            expect(codec.decode(b('03'))).toBe(Hybrid.Seven);
        });

        it('pushes the offset forward when writing', () => {
            expect(codec.write(Hybrid.Zero, new Uint8Array(10), 6)).toBe(7);
        });

        it('pushes the offset forward when reading', () => {
            expect(codec.read(b('ffff00'), 2)).toStrictEqual([Hybrid.Zero, 3]);
        });

        it('throws an error when trying to encode a missing variant', () => {
            // @ts-expect-error Invalid enum variant.
            expect(() => codec.encode('Missing')).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                    formattedNumericalValues: '0, 5-6',
                    numericalValues: [0, 5, 6],
                    stringValues: ['Zero', 'Five', 'Six', 'Seven', 'seven'],
                    variant: 'Missing',
                }),
            );
        });

        it('throws an error when trying to decode a out-of-range discriminator', () => {
            expect(() => codec.decode(b('04'))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                    discriminator: 4,
                    formattedValidDiscriminators: '0-3',
                    validDiscriminators: [0, 1, 2, 3],
                }),
            );
        });

        it('encodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Hybrid, { size: getU32Codec() });
            expect(u32Codec.encode(Hybrid.Zero)).toStrictEqual(b('00000000'));
            expect(u32Codec.encode(Hybrid.Five)).toStrictEqual(b('01000000'));
            expect(u32Codec.encode(Hybrid.Six)).toStrictEqual(b('02000000'));
            expect(u32Codec.encode(Hybrid.Seven)).toStrictEqual(b('03000000'));
        });

        it('decodes enums using a custom discriminator size', () => {
            const u32Codec = getEnumCodec(Hybrid, { size: getU32Codec() });
            expect(u32Codec.decode(b('00000000'))).toBe(Hybrid.Zero);
            expect(u32Codec.decode(b('01000000'))).toBe(Hybrid.Five);
            expect(u32Codec.decode(b('02000000'))).toBe(Hybrid.Six);
            expect(u32Codec.decode(b('03000000'))).toBe(Hybrid.Seven);
        });

        it('returns the correct default fixed size', () => {
            expect(codec.fixedSize).toBe(1);
        });

        it('returns the correct custom fixed size', () => {
            const u32Codec = getEnumCodec(Hybrid, { size: getU32Codec() });
            expect(u32Codec.fixedSize).toBe(4);
        });

        it('returns the correct custom variable size', () => {
            const u32Codec = getEnumCodec(Hybrid, { size: getShortU16Codec() });
            expect(u32Codec.getSizeFromValue(Hybrid.Zero)).toBe(1);
            expect(u32Codec.maxSize).toBe(3);
        });

        it('throws an error when trying to use values as discriminators', () => {
            expect(() => getEnumCodec(Hybrid, { useValuesAsDiscriminators: true })).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__CANNOT_USE_LEXICAL_VALUES_AS_ENUM_DISCRIMINATORS, {
                    stringValues: ['seven'],
                }),
            );
        });
    });
});
