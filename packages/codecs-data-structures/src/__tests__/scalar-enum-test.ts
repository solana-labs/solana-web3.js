import { getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import {
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import { getScalarEnumCodec } from '../scalar-enum.js';
import { b } from './__setup__.js';

describe('getScalarEnumCodec', () => {
    const scalarEnum = getScalarEnumCodec;
    const u32 = getU32Codec;
    const u64 = getU64Codec;

    enum Empty {}
    enum Feedback {
        BAD,
        GOOD,
    }
    enum Direction {
        UP = 'Up',
        DOWN = 'Down',
        LEFT = 'Left',
        RIGHT = 'Right',
    }
    enum Hybrid {
        NUMERIC,
        LEXICAL = 'Lexical',
    }

    it('encodes scalar enums', () => {
        // Bad.
        expect(scalarEnum(Feedback).encode(Feedback.BAD)).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).encode('BAD')).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).encode(0)).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).read(b('00'), 0)).toStrictEqual([Feedback.BAD, 1]);
        expect(scalarEnum(Feedback).read(b('ffff00'), 2)).toStrictEqual([Feedback.BAD, 3]);

        // Good.
        expect(scalarEnum(Feedback).encode(Feedback.GOOD)).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).encode('GOOD')).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).encode(1)).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).read(b('01'), 0)).toStrictEqual([Feedback.GOOD, 1]);
        expect(scalarEnum(Feedback).read(b('ffff01'), 2)).toStrictEqual([Feedback.GOOD, 3]);

        // Custom size.
        const u64Feedback = scalarEnum(Feedback, { size: u64() });
        expect(u64Feedback.encode(Feedback.GOOD)).toStrictEqual(b('0100000000000000'));
        expect(u64Feedback.read(b('0100000000000000'), 0)).toStrictEqual([Feedback.GOOD, 8]);

        // Invalid examples.
        // @ts-expect-error Invalid scalar enum variant.
        expect(() => scalarEnum(Feedback).encode('Missing')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT, {
                maxRange: 1,
                minRange: 0,
                value: 'Missing',
                variants: ['BAD', 'GOOD'],
            }),
        );
        expect(() => scalarEnum(Feedback).read(new Uint8Array([2]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 2,
                maxRange: 1,
                minRange: 0,
            }),
        );
    });

    it('encodes lexical scalar enums', () => {
        // Up.
        expect(scalarEnum(Direction).encode(Direction.UP)).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).encode('UP')).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).encode('Up' as Direction)).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).read(b('00'), 0)).toStrictEqual([Direction.UP, 1]);
        expect(scalarEnum(Direction).read(b('ffff00'), 2)).toStrictEqual([Direction.UP, 3]);

        // Down.
        expect(scalarEnum(Direction).encode(Direction.DOWN)).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).encode('DOWN')).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).encode('Down' as Direction)).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).read(b('01'), 0)).toStrictEqual([Direction.DOWN, 1]);
        expect(scalarEnum(Direction).read(b('ffff01'), 2)).toStrictEqual([Direction.DOWN, 3]);

        // Left.
        expect(scalarEnum(Direction).encode(Direction.LEFT)).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).encode('LEFT')).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).encode('Left' as Direction)).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).read(b('02'), 0)).toStrictEqual([Direction.LEFT, 1]);
        expect(scalarEnum(Direction).read(b('ffff02'), 2)).toStrictEqual([Direction.LEFT, 3]);

        // Right.
        expect(scalarEnum(Direction).encode(Direction.RIGHT)).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).encode('RIGHT')).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).encode('Right' as Direction)).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).read(b('03'), 0)).toStrictEqual([Direction.RIGHT, 1]);
        expect(scalarEnum(Direction).read(b('ffff03'), 2)).toStrictEqual([Direction.RIGHT, 3]);

        // Invalid examples.
        // @ts-expect-error Invalid scalar enum variant.
        expect(() => scalarEnum(Direction).encode('Diagonal')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT, {
                maxRange: 3,
                minRange: 0,
                value: 'Diagonal',
                variants: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'Up', 'Down', 'Left', 'Right'],
            }),
        );
        expect(() => scalarEnum(Direction).read(new Uint8Array([4]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 4,
                maxRange: 3,
                minRange: 0,
            }),
        );
    });

    it('encodes hybrid scalar enums', () => {
        // Numeric.
        expect(scalarEnum(Hybrid).encode(Hybrid.NUMERIC)).toStrictEqual(b('00'));
        expect(scalarEnum(Hybrid).encode('NUMERIC')).toStrictEqual(b('00'));
        expect(scalarEnum(Hybrid).encode(0)).toStrictEqual(b('00'));
        expect(scalarEnum(Hybrid).read(b('00'), 0)).toStrictEqual([Hybrid.NUMERIC, 1]);
        expect(scalarEnum(Hybrid).read(b('ffff00'), 2)).toStrictEqual([Hybrid.NUMERIC, 3]);

        // Lexical.
        expect(scalarEnum(Hybrid).encode(Hybrid.LEXICAL)).toStrictEqual(b('01'));
        expect(scalarEnum(Hybrid).encode('LEXICAL')).toStrictEqual(b('01'));
        expect(scalarEnum(Hybrid).encode('Lexical' as Hybrid)).toStrictEqual(b('01'));
        expect(scalarEnum(Hybrid).read(b('01'), 0)).toStrictEqual([Hybrid.LEXICAL, 1]);
        expect(scalarEnum(Hybrid).read(b('ffff01'), 2)).toStrictEqual([Hybrid.LEXICAL, 3]);

        // Invalid examples.
        // @ts-expect-error Invalid scalar enum variant.
        expect(() => scalarEnum(Hybrid).encode('Missing')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_SCALAR_ENUM_VARIANT, {
                maxRange: 1,
                minRange: 0,
                value: 'Missing',
                variants: ['NUMERIC', 'LEXICAL', 'Lexical'],
            }),
        );
        expect(() => scalarEnum(Hybrid).read(new Uint8Array([2]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 2,
                maxRange: 1,
                minRange: 0,
            }),
        );
    });

    it('has the right sizes', () => {
        expect(scalarEnum(Empty).fixedSize).toBe(1);
        expect(scalarEnum(Feedback).fixedSize).toBe(1);
        expect(scalarEnum(Direction).fixedSize).toBe(1);
        expect(scalarEnum(Hybrid).fixedSize).toBe(1);
        expect(scalarEnum(Feedback, { size: u32() }).fixedSize).toBe(4);
    });
});
