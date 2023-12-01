import { FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { getBitArrayCodec, getBitArrayDecoder, getBitArrayEncoder } from '../bit-array';

{
    // [getBitArrayEncoder]: It keeps track of the encoder's fixed size.
    getBitArrayEncoder(42) satisfies FixedSizeEncoder<boolean[], 42>;
}

{
    // [getBitArrayDecoder]: It keeps track of the decoder's fixed size.
    getBitArrayDecoder(42) satisfies FixedSizeDecoder<boolean[], 42>;
}

{
    // [getBitArrayCodec]: It keeps track of the codec's fixed size.
    getBitArrayCodec(42) satisfies FixedSizeCodec<boolean[], boolean[], 42>;
}
