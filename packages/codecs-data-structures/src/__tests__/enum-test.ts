import { getU32Codec, getU64Codec } from '@solana/codecs-numbers';
import {
    SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT,
    SolanaError,
} from '@solana/errors';

import { getEnumCodec } from '../enum';
import { b } from './__setup__';

describe('getEnumCodec', () => {
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

    it('encodes enums', () => {
        // Bad.
        expect(getEnumCodec(Feedback).encode(Feedback.BAD)).toStrictEqual(b('00'));
        expect(getEnumCodec(Feedback).encode('BAD')).toStrictEqual(b('00'));
        expect(getEnumCodec(Feedback).encode(0)).toStrictEqual(b('00'));
        expect(getEnumCodec(Feedback).read(b('00'), 0)).toStrictEqual([Feedback.BAD, 1]);
        expect(getEnumCodec(Feedback).read(b('ffff00'), 2)).toStrictEqual([Feedback.BAD, 3]);

        // Good.
        expect(getEnumCodec(Feedback).encode(Feedback.GOOD)).toStrictEqual(b('01'));
        expect(getEnumCodec(Feedback).encode('GOOD')).toStrictEqual(b('01'));
        expect(getEnumCodec(Feedback).encode(1)).toStrictEqual(b('01'));
        expect(getEnumCodec(Feedback).read(b('01'), 0)).toStrictEqual([Feedback.GOOD, 1]);
        expect(getEnumCodec(Feedback).read(b('ffff01'), 2)).toStrictEqual([Feedback.GOOD, 3]);

        // Custom size.
        const u64Feedback = getEnumCodec(Feedback, { size: u64() });
        expect(u64Feedback.encode(Feedback.GOOD)).toStrictEqual(b('0100000000000000'));
        expect(u64Feedback.read(b('0100000000000000'), 0)).toStrictEqual([Feedback.GOOD, 8]);

        // Invalid examples.
        // @ts-expect-error Invalid enum variant.
        expect(() => getEnumCodec(Feedback).encode('Missing')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                maxRange: 1,
                minRange: 0,
                value: 'Missing',
                variants: ['BAD', 'GOOD'],
            }),
        );
        expect(() => getEnumCodec(Feedback).read(new Uint8Array([2]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 2,
                maxRange: 1,
                minRange: 0,
            }),
        );
    });

    it('encodes lexical enums', () => {
        // Up.
        expect(getEnumCodec(Direction).encode(Direction.UP)).toStrictEqual(b('00'));
        expect(getEnumCodec(Direction).encode('UP')).toStrictEqual(b('00'));
        expect(getEnumCodec(Direction).encode('Up' as Direction)).toStrictEqual(b('00'));
        expect(getEnumCodec(Direction).read(b('00'), 0)).toStrictEqual([Direction.UP, 1]);
        expect(getEnumCodec(Direction).read(b('ffff00'), 2)).toStrictEqual([Direction.UP, 3]);

        // Down.
        expect(getEnumCodec(Direction).encode(Direction.DOWN)).toStrictEqual(b('01'));
        expect(getEnumCodec(Direction).encode('DOWN')).toStrictEqual(b('01'));
        expect(getEnumCodec(Direction).encode('Down' as Direction)).toStrictEqual(b('01'));
        expect(getEnumCodec(Direction).read(b('01'), 0)).toStrictEqual([Direction.DOWN, 1]);
        expect(getEnumCodec(Direction).read(b('ffff01'), 2)).toStrictEqual([Direction.DOWN, 3]);

        // Left.
        expect(getEnumCodec(Direction).encode(Direction.LEFT)).toStrictEqual(b('02'));
        expect(getEnumCodec(Direction).encode('LEFT')).toStrictEqual(b('02'));
        expect(getEnumCodec(Direction).encode('Left' as Direction)).toStrictEqual(b('02'));
        expect(getEnumCodec(Direction).read(b('02'), 0)).toStrictEqual([Direction.LEFT, 1]);
        expect(getEnumCodec(Direction).read(b('ffff02'), 2)).toStrictEqual([Direction.LEFT, 3]);

        // Right.
        expect(getEnumCodec(Direction).encode(Direction.RIGHT)).toStrictEqual(b('03'));
        expect(getEnumCodec(Direction).encode('RIGHT')).toStrictEqual(b('03'));
        expect(getEnumCodec(Direction).encode('Right' as Direction)).toStrictEqual(b('03'));
        expect(getEnumCodec(Direction).read(b('03'), 0)).toStrictEqual([Direction.RIGHT, 1]);
        expect(getEnumCodec(Direction).read(b('ffff03'), 2)).toStrictEqual([Direction.RIGHT, 3]);

        // Invalid examples.
        // @ts-expect-error Invalid enum variant.
        expect(() => getEnumCodec(Direction).encode('Diagonal')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                maxRange: 3,
                minRange: 0,
                value: 'Diagonal',
                variants: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'Up', 'Down', 'Left', 'Right'],
            }),
        );
        expect(() => getEnumCodec(Direction).read(new Uint8Array([4]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 4,
                maxRange: 3,
                minRange: 0,
            }),
        );
    });

    it('encodes hybrid enums', () => {
        // Numeric.
        expect(getEnumCodec(Hybrid).encode(Hybrid.NUMERIC)).toStrictEqual(b('00'));
        expect(getEnumCodec(Hybrid).encode('NUMERIC')).toStrictEqual(b('00'));
        expect(getEnumCodec(Hybrid).encode(0)).toStrictEqual(b('00'));
        expect(getEnumCodec(Hybrid).read(b('00'), 0)).toStrictEqual([Hybrid.NUMERIC, 1]);
        expect(getEnumCodec(Hybrid).read(b('ffff00'), 2)).toStrictEqual([Hybrid.NUMERIC, 3]);

        // Lexical.
        expect(getEnumCodec(Hybrid).encode(Hybrid.LEXICAL)).toStrictEqual(b('01'));
        expect(getEnumCodec(Hybrid).encode('LEXICAL')).toStrictEqual(b('01'));
        expect(getEnumCodec(Hybrid).encode('Lexical' as Hybrid)).toStrictEqual(b('01'));
        expect(getEnumCodec(Hybrid).read(b('01'), 0)).toStrictEqual([Hybrid.LEXICAL, 1]);
        expect(getEnumCodec(Hybrid).read(b('ffff01'), 2)).toStrictEqual([Hybrid.LEXICAL, 3]);

        // Invalid examples.
        // @ts-expect-error Invalid enum variant.
        expect(() => getEnumCodec(Hybrid).encode('Missing')).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_ENUM_VARIANT, {
                maxRange: 1,
                minRange: 0,
                value: 'Missing',
                variants: ['NUMERIC', 'LEXICAL', 'Lexical'],
            }),
        );
        expect(() => getEnumCodec(Hybrid).read(new Uint8Array([2]), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENUM_DISCRIMINATOR_OUT_OF_RANGE, {
                discriminator: 2,
                maxRange: 1,
                minRange: 0,
            }),
        );
    });

    it('has the right sizes', () => {
        expect(getEnumCodec(Empty).fixedSize).toBe(1);
        expect(getEnumCodec(Feedback).fixedSize).toBe(1);
        expect(getEnumCodec(Direction).fixedSize).toBe(1);
        expect(getEnumCodec(Hybrid).fixedSize).toBe(1);
        expect(getEnumCodec(Feedback, { size: u32() }).fixedSize).toBe(4);
    });
});
