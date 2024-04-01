import { FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { getConstantCodec, getConstantDecoder, getConstantEncoder } from '../constant';

const constant = {} as Uint8Array;
const constant3bytes = {} as Uint8Array & { length: 3 };

{
    // [getConstantEncoder]: It returns a fixed size encoder.
    getConstantEncoder(constant) satisfies FixedSizeEncoder<void>;
    getConstantEncoder(constant3bytes) satisfies FixedSizeEncoder<void, 3>;
}

{
    // [getConstantDecoder]: It returns a fixed size decoder.
    getConstantDecoder(constant) satisfies FixedSizeDecoder<void>;
    getConstantDecoder(constant3bytes) satisfies FixedSizeDecoder<void, 3>;
}

{
    // [getConstantCodec]: It returns a fixed size codec.
    getConstantCodec(constant) satisfies FixedSizeCodec<void>;
    getConstantCodec(constant3bytes) satisfies FixedSizeCodec<void, void, 3>;
}
