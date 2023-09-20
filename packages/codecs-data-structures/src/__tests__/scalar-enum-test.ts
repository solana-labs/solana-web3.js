import { getU32Codec, getU64Codec } from '@solana/codecs-numbers';

import { getScalarEnumCodec } from '../scalar-enum';
import { b } from './__setup__';

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

    it('encodes scalar enums', () => {
        // Bad.
        expect(scalarEnum(Feedback).encode(Feedback.BAD)).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).encode('BAD')).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).encode('0')).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).encode(0)).toStrictEqual(b('00'));
        expect(scalarEnum(Feedback).decode(b('00'))).toStrictEqual([Feedback.BAD, 1]);
        expect(scalarEnum(Feedback).decode(b('ffff00'), 2)).toStrictEqual([Feedback.BAD, 3]);

        // Good.
        expect(scalarEnum(Feedback).encode(Feedback.GOOD)).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).encode('GOOD')).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).encode('1')).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).encode(1)).toStrictEqual(b('01'));
        expect(scalarEnum(Feedback).decode(b('01'))).toStrictEqual([Feedback.GOOD, 1]);
        expect(scalarEnum(Feedback).decode(b('ffff01'), 2)).toStrictEqual([Feedback.GOOD, 3]);

        // Custom size.
        const u64Feedback = scalarEnum(Feedback, { size: u64() });
        expect(u64Feedback.encode(Feedback.GOOD)).toStrictEqual(b('0100000000000000'));
        expect(u64Feedback.decode(b('0100000000000000'))).toStrictEqual([Feedback.GOOD, 8]);

        // Invalid examples.
        expect(() => scalarEnum(Feedback).encode('Missing')).toThrow(
            'Invalid scalar enum variant. ' +
                'Expected one of [0, 1, BAD, GOOD] or a number between 0 and 1, ' +
                'got "Missing".'
        );
        expect(() => scalarEnum(Feedback).decode(new Uint8Array([2]))).toThrow(
            'Enum discriminator out of range. Expected a number between 0 and 1, got 2.'
        );
    });

    it('encodes lexical scalar enums', () => {
        // Up.
        expect(scalarEnum(Direction).encode(Direction.UP)).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).encode('Up' as Direction)).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).encode('UP' as Direction)).toStrictEqual(b('00'));
        expect(scalarEnum(Direction).decode(b('00'))).toStrictEqual([Direction.UP, 1]);
        expect(scalarEnum(Direction).decode(b('ffff00'), 2)).toStrictEqual([Direction.UP, 3]);

        // Down.
        expect(scalarEnum(Direction).encode(Direction.DOWN)).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).encode('Down' as Direction)).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).encode('DOWN' as Direction)).toStrictEqual(b('01'));
        expect(scalarEnum(Direction).decode(b('01'))).toStrictEqual([Direction.DOWN, 1]);
        expect(scalarEnum(Direction).decode(b('ffff01'), 2)).toStrictEqual([Direction.DOWN, 3]);

        // Left.
        expect(scalarEnum(Direction).encode(Direction.LEFT)).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).encode('Left' as Direction)).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).encode('LEFT' as Direction)).toStrictEqual(b('02'));
        expect(scalarEnum(Direction).decode(b('02'))).toStrictEqual([Direction.LEFT, 1]);
        expect(scalarEnum(Direction).decode(b('ffff02'), 2)).toStrictEqual([Direction.LEFT, 3]);

        // Right.
        expect(scalarEnum(Direction).encode(Direction.RIGHT)).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).encode('Right' as Direction)).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).encode('RIGHT' as Direction)).toStrictEqual(b('03'));
        expect(scalarEnum(Direction).decode(b('03'))).toStrictEqual([Direction.RIGHT, 1]);
        expect(scalarEnum(Direction).decode(b('ffff03'), 2)).toStrictEqual([Direction.RIGHT, 3]);

        // Invalid examples.
        expect(() => scalarEnum(Direction).encode('Diagonal' as unknown as Direction)).toThrow(
            'Invalid scalar enum variant. ' +
                'Expected one of [UP, DOWN, LEFT, RIGHT, Up, Down, Left, Right] ' +
                'or a number between 0 and 3, got "Diagonal".'
        );
        expect(() => scalarEnum(Direction).decode(new Uint8Array([4]))).toThrow(
            'Enum discriminator out of range. Expected a number between 0 and 3, got 4.'
        );
    });

    it('has the right description', () => {
        expect(scalarEnum(Empty).description).toBe('enum(; u8)');
        expect(scalarEnum(Feedback).description).toBe('enum(BAD, GOOD; u8)');
        expect(scalarEnum(Feedback, { size: u32() }).description).toBe('enum(BAD, GOOD; u32(le))');
        expect(scalarEnum(Direction).description).toBe('enum(Up, Down, Left, Right; u8)');
        expect(scalarEnum(Direction, { description: 'my enum' }).description).toBe('my enum');
    });

    it('has the right sizes', () => {
        expect(scalarEnum(Empty).fixedSize).toBe(1);
        expect(scalarEnum(Empty).maxSize).toBe(1);
        expect(scalarEnum(Feedback).fixedSize).toBe(1);
        expect(scalarEnum(Feedback).maxSize).toBe(1);
        expect(scalarEnum(Direction).fixedSize).toBe(1);
        expect(scalarEnum(Direction).maxSize).toBe(1);
        expect(scalarEnum(Feedback, { size: u32() }).fixedSize).toBe(4);
        expect(scalarEnum(Feedback, { size: u32() }).maxSize).toBe(4);
    });
});
