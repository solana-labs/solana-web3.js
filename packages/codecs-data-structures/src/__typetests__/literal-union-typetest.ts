import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';

import { getLiteralUnionCodec, getLiteralUnionDecoder, getLiteralUnionEncoder } from '../literal-union';

{
    // [getLiteralUnionEncoder]: It knows if the encoder is fixed size or variable size.
    getLiteralUnionEncoder(['one', 2, 3n]) satisfies FixedSizeEncoder<'one' | 2 | 3n, 1>;
    getLiteralUnionEncoder(['one', 2, 3n], { size: getU32Encoder() }) satisfies FixedSizeEncoder<'one' | 2 | 3n, 4>;
    getLiteralUnionEncoder(['one', 2, 3n], { size: {} as VariableSizeEncoder<number> }) satisfies VariableSizeEncoder<
        'one' | 2 | 3n
    >;
}

{
    // [getLiteralUnionDecoder]: It knows if the decoder is fixed size or variable size.
    getLiteralUnionDecoder(['one', 2, 3n]) satisfies FixedSizeDecoder<'one' | 2 | 3n, 1>;
    getLiteralUnionDecoder(['one', 2, 3n], { size: getU32Decoder() }) satisfies FixedSizeDecoder<'one' | 2 | 3n, 4>;
    getLiteralUnionDecoder(['one', 2, 3n], { size: {} as VariableSizeDecoder<number> }) satisfies VariableSizeDecoder<
        'one' | 2 | 3n
    >;
}

{
    // [getLiteralUnionCodec]: It knows if the codec is fixed size or variable size.
    getLiteralUnionCodec(['one', 2, 3n]) satisfies FixedSizeCodec<'one' | 2 | 3n, 'one' | 2 | 3n, 1>;
    getLiteralUnionCodec(['one', 2, 3n], { size: getU32Codec() }) satisfies FixedSizeCodec<
        'one' | 2 | 3n,
        'one' | 2 | 3n,
        4
    >;
    getLiteralUnionCodec(['one', 2, 3n], { size: {} as VariableSizeCodec<number> }) satisfies VariableSizeCodec<
        'one' | 2 | 3n
    >;
}
