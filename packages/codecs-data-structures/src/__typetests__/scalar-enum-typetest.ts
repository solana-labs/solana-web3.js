import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';

import { getScalarEnumCodec, getScalarEnumDecoder, getScalarEnumEncoder } from '../scalar-enum.js';

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
    // [getScalarEnumEncoder]: It knows if the encoder is fixed size or variable size.
    getScalarEnumEncoder(Feedback) satisfies FixedSizeEncoder<FeedbackInput, 1>;
    getScalarEnumEncoder(Direction) satisfies FixedSizeEncoder<DirectionInput, 1>;
    getScalarEnumEncoder(Feedback, { size: getU32Encoder() }) satisfies FixedSizeEncoder<FeedbackInput, 4>;
    getScalarEnumEncoder(Feedback, {
        size: {} as VariableSizeEncoder<number>,
    }) satisfies VariableSizeEncoder<FeedbackInput>;
}

{
    // [getScalarEnumDecoder]: It knows if the decoder is fixed size or variable size.
    getScalarEnumDecoder(Feedback) satisfies FixedSizeDecoder<Feedback, 1>;
    getScalarEnumDecoder(Direction) satisfies FixedSizeDecoder<Direction, 1>;
    getScalarEnumDecoder(Feedback, { size: getU32Decoder() }) satisfies FixedSizeDecoder<Feedback, 4>;
    getScalarEnumDecoder(Feedback, { size: {} as VariableSizeDecoder<number> }) satisfies VariableSizeDecoder<Feedback>;
}

{
    // [getScalarEnumCodec]: It knows if the codec is fixed size or variable size.
    getScalarEnumCodec(Feedback) satisfies FixedSizeCodec<FeedbackInput, Feedback, 1>;
    getScalarEnumCodec(Direction) satisfies FixedSizeCodec<DirectionInput, Direction, 1>;
    getScalarEnumCodec(Feedback, { size: getU32Codec() }) satisfies FixedSizeCodec<FeedbackInput, Feedback, 4>;
    getScalarEnumCodec(Feedback, { size: {} as VariableSizeCodec<number> }) satisfies VariableSizeCodec<
        FeedbackInput,
        Feedback
    >;
}
