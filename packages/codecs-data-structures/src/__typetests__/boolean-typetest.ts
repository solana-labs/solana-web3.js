import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    getShortU16Codec,
    getShortU16Decoder,
    getShortU16Encoder,
    getU32Codec,
    getU32Decoder,
    getU32Encoder,
} from '@solana/codecs-numbers';

import { getBooleanCodec, getBooleanDecoder, getBooleanEncoder } from '../boolean';

{
    // [getBooleanEncoder]: It knows if the encoder is fixed size or variable size.
    getBooleanEncoder() satisfies FixedSizeEncoder<boolean, 1>;
    getBooleanEncoder({ size: getU32Encoder() }) satisfies FixedSizeEncoder<boolean, 4>;
    getBooleanEncoder({ size: getShortU16Encoder() }) satisfies VariableSizeEncoder<boolean>;
}

{
    // [getBooleanDecoder]: It knows if the decoder is fixed size or variable size.
    getBooleanDecoder() satisfies FixedSizeDecoder<boolean, 1>;
    getBooleanDecoder({ size: getU32Decoder() }) satisfies FixedSizeDecoder<boolean, 4>;
    getBooleanDecoder({ size: getShortU16Decoder() }) satisfies VariableSizeDecoder<boolean>;
}

{
    // [getBooleanCodec]: It knows if the codec is fixed size or variable size.
    getBooleanCodec() satisfies FixedSizeCodec<boolean, boolean, 1>;
    getBooleanCodec({ size: getU32Codec() }) satisfies FixedSizeCodec<boolean, boolean, 4>;
    getBooleanCodec({ size: getShortU16Codec() }) satisfies VariableSizeCodec<boolean>;
}
