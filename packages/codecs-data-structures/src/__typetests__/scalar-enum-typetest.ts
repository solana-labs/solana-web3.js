import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';

import { getScalarEnumCodec, getScalarEnumDecoder, getScalarEnumEncoder } from '../scalar-enum';

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

{
    // [getScalarEnumEncoder]: It knows if the encoder is fixed size or variable size.
    getScalarEnumEncoder(Feedback) satisfies FixedSizeEncoder<Feedback, 1>;
    getScalarEnumEncoder(Direction) satisfies FixedSizeEncoder<Direction, 1>;
    getScalarEnumEncoder(Feedback, { size: getU32Encoder() }) satisfies FixedSizeEncoder<Feedback, 4>;
    getScalarEnumEncoder(Feedback, { size: {} as VariableSizeEncoder<number> }) satisfies VariableSizeEncoder<Feedback>;
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
    getScalarEnumCodec(Feedback) satisfies FixedSizeCodec<Feedback, Feedback, 1>;
    getScalarEnumCodec(Direction) satisfies FixedSizeCodec<Direction, Direction, 1>;
    getScalarEnumCodec(Feedback, { size: getU32Codec() }) satisfies FixedSizeCodec<Feedback, Feedback, 4>;
    getScalarEnumCodec(Feedback, { size: {} as VariableSizeCodec<number> }) satisfies VariableSizeCodec<Feedback>;
}
