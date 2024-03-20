import { Codec, Decoder, Encoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';

import { getBooleanCodec, getBooleanDecoder, getBooleanEncoder } from '../boolean.js';

{
    // [getBooleanEncoder]: It knows if the encoder is fixed size or variable size.
    getBooleanEncoder() satisfies FixedSizeEncoder<boolean, 1>;
    getBooleanEncoder({ size: getU32Encoder() }) satisfies FixedSizeEncoder<boolean, 4>;
    getBooleanEncoder({ size: {} as Encoder<number> }) satisfies Encoder<boolean>;
}

{
    // [getBooleanDecoder]: It knows if the decoder is fixed size or variable size.
    getBooleanDecoder() satisfies FixedSizeDecoder<boolean, 1>;
    getBooleanDecoder({ size: getU32Decoder() }) satisfies FixedSizeDecoder<boolean, 4>;
    getBooleanDecoder({ size: {} as Decoder<number> }) satisfies Decoder<boolean>;
}

{
    // [getBooleanCodec]: It knows if the codec is fixed size or variable size.
    getBooleanCodec() satisfies FixedSizeCodec<boolean, boolean, 1>;
    getBooleanCodec({ size: getU32Codec() }) satisfies FixedSizeCodec<boolean, boolean, 4>;
    getBooleanCodec({ size: {} as Codec<number> }) satisfies Codec<boolean>;
}
