import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { getBytesCodec, getBytesDecoder, getBytesEncoder } from '../bytes.js';

{
    // [getBytesEncoder]: It knows if the encoder is fixed size or variable size.
    getBytesEncoder({ size: 42 }) satisfies FixedSizeEncoder<Uint8Array, 42>;
    getBytesEncoder() satisfies VariableSizeEncoder<Uint8Array>;
    getBytesEncoder({ size: 'variable' }) satisfies VariableSizeEncoder<Uint8Array>;
    getBytesEncoder({ size: {} as NumberEncoder }) satisfies VariableSizeEncoder<Uint8Array>;
}

{
    // [getBytesDecoder]: It knows if the decoder is fixed size or variable size.
    getBytesDecoder({ size: 42 }) satisfies FixedSizeDecoder<Uint8Array, 42>;
    getBytesDecoder() satisfies VariableSizeDecoder<Uint8Array>;
    getBytesDecoder({ size: 'variable' }) satisfies VariableSizeDecoder<Uint8Array>;
    getBytesDecoder({ size: {} as NumberDecoder }) satisfies VariableSizeDecoder<Uint8Array>;
}

{
    // [getBytesCodec]: It knows if the codec is fixed size or variable size.
    getBytesCodec({ size: 42 }) satisfies FixedSizeCodec<Uint8Array, Uint8Array, 42>;
    getBytesCodec() satisfies VariableSizeCodec<Uint8Array>;
    getBytesCodec({ size: 'variable' }) satisfies VariableSizeCodec<Uint8Array>;
    getBytesCodec({ size: {} as NumberCodec }) satisfies VariableSizeCodec<Uint8Array>;
}
