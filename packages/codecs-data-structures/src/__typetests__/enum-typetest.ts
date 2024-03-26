import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';

import { getEnumCodec, getEnumDecoder, getEnumEncoder } from '../enum';

enum Feedback {
    BAD,
    GOOD,
}
type FeedbackInput = Feedback | keyof typeof Feedback;

enum Direction {
    UP = 'Up',
    DOWN = 'Down',
    LEFT = 'Left',
    RIGHT = 'Right',
}
type DirectionInput = Direction | keyof typeof Direction;

{
    // [getEnumEncoder]: It knows if the encoder is fixed size or variable size.
    getEnumEncoder(Feedback) satisfies FixedSizeEncoder<FeedbackInput, 1>;
    getEnumEncoder(Direction) satisfies FixedSizeEncoder<DirectionInput, 1>;
    getEnumEncoder(Feedback, { size: getU32Encoder() }) satisfies FixedSizeEncoder<FeedbackInput, 4>;
    getEnumEncoder(Feedback, {
        size: {} as VariableSizeEncoder<number>,
    }) satisfies VariableSizeEncoder<FeedbackInput>;
}

{
    // [getEnumDecoder]: It knows if the decoder is fixed size or variable size.
    getEnumDecoder(Feedback) satisfies FixedSizeDecoder<Feedback, 1>;
    getEnumDecoder(Direction) satisfies FixedSizeDecoder<Direction, 1>;
    getEnumDecoder(Feedback, { size: getU32Decoder() }) satisfies FixedSizeDecoder<Feedback, 4>;
    getEnumDecoder(Feedback, { size: {} as VariableSizeDecoder<number> }) satisfies VariableSizeDecoder<Feedback>;
}

{
    // [getEnumCodec]: It knows if the codec is fixed size or variable size.
    getEnumCodec(Feedback) satisfies FixedSizeCodec<FeedbackInput, Feedback, 1>;
    getEnumCodec(Direction) satisfies FixedSizeCodec<DirectionInput, Direction, 1>;
    getEnumCodec(Feedback, { size: getU32Codec() }) satisfies FixedSizeCodec<FeedbackInput, Feedback, 4>;
    getEnumCodec(Feedback, { size: {} as VariableSizeCodec<number> }) satisfies VariableSizeCodec<
        FeedbackInput,
        Feedback
    >;
}
