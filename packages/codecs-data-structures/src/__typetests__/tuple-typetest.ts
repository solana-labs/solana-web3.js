import {
    Codec,
    Decoder,
    Encoder,
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
    getTupleEncoder([]) satisfies FixedSizeEncoder<readonly []>;
    getTupleEncoder([getU8Encoder()]) satisfies FixedSizeEncoder<readonly [number]>;
    getTupleEncoder([getU8Encoder(), getUtf8Encoder()]) satisfies VariableSizeEncoder<readonly [number, string]>;
}

{
    // [getTupleEncoder]: It infers the correct tuple type from the encoders.
    getTupleEncoder([getU8Encoder(), getUtf8Encoder()]) satisfies Encoder<readonly [number, string]>;
    // @ts-expect-error It does not combine all items into a single union type.
    getTupleEncoder([getU8Encoder(), getUtf8Encoder()]) satisfies Encoder<readonly (number | string)[]>;
}

{
    // [getTupleDecoder]: It knows if the decoder is fixed size or variable size.
    getTupleDecoder([]) satisfies FixedSizeDecoder<readonly []>;
    getTupleDecoder([getU8Decoder()]) satisfies FixedSizeDecoder<readonly [number]>;
    getTupleDecoder([getU8Decoder(), getUtf8Decoder()]) satisfies VariableSizeDecoder<readonly [number, string]>;
}

{
    // [getTupleDecoder]: It infers the correct tuple type from the decoders.
    getTupleDecoder([getU8Decoder(), getUtf8Decoder()]) satisfies Decoder<readonly [number, string]>;
    // Because decoder types are returned (and not requested), Decoder<[number, string]> does satisfy Decoder<(number | string)[]>.
    getTupleDecoder([getU8Decoder(), getUtf8Decoder()]) satisfies Decoder<readonly (number | string)[]>;
    // @ts-expect-error However, we cannot do things like swapping the order of the types.
    getTupleDecoder([getU8Decoder(), getUtf8Decoder()]) satisfies Decoder<readonly [string, number]>;
}

{
    // [getTupleCodec]: It knows if the codec is fixed size or variable size.
    getTupleCodec([]) satisfies FixedSizeCodec<readonly []>;
    getTupleCodec([getU8Codec()]) satisfies FixedSizeCodec<readonly [number]>;
    getTupleCodec([getU8Codec(), getUtf8Codec()]) satisfies VariableSizeCodec<readonly [number, string]>;
}

{
    // [getTupleCodec]: It infers the correct tuple type from the codecs.
    getTupleCodec([getU8Codec(), getUtf8Codec()]) satisfies Codec<readonly [number, string]>;
    // @ts-expect-error It does not combine all items into a single union type.
    getTupleCodec([getU8Codec(), getUtf8Codec()]) satisfies Codec<readonly (number | string)[]>;
}
