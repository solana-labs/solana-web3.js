import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU8Codec, getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';
import { getUtf8Codec, getUtf8Decoder, getUtf8Encoder } from '@solana/codecs-strings';

import { getTupleCodec, getTupleDecoder, getTupleEncoder } from '../tuple';

{
    // [getTupleEncoder]: It knows if the encoder is fixed size or variable size.
    getTupleEncoder([]) satisfies FixedSizeEncoder<[]>;
    getTupleEncoder([getU8Encoder()]) satisfies FixedSizeEncoder<[number]>;
    getTupleEncoder([getU8Encoder(), getUtf8Encoder()]) satisfies VariableSizeEncoder<[number, string]>;
}

{
    // [getTupleDecoder]: It knows if the decoder is fixed size or variable size.
    getTupleDecoder([]) satisfies FixedSizeDecoder<[]>;
    getTupleDecoder([getU8Decoder()]) satisfies FixedSizeDecoder<[number]>;
    getTupleDecoder([getU8Decoder(), getUtf8Decoder()]) satisfies VariableSizeDecoder<[number, string]>;
}

{
    // [getTupleCodec]: It knows if the codec is fixed size or variable size.
    getTupleCodec([]) satisfies FixedSizeCodec<[]>;
    getTupleCodec([getU8Codec()]) satisfies FixedSizeCodec<[number]>;
    getTupleCodec([getU8Codec(), getUtf8Codec()]) satisfies VariableSizeCodec<[number, string]>;
}
