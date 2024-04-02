import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    ReadonlyUint8Array,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { NumberCodec, NumberDecoder, NumberEncoder } from '@solana/codecs-numbers';

import { getBytesCodec, getBytesDecoder, getBytesEncoder } from '../bytes';

{
    // [getBytesEncoder]: It knows if the encoder is fixed size or variable size.
    getBytesEncoder({ size: 42 }) satisfies FixedSizeEncoder<ReadonlyUint8Array | Uint8Array, 42>;
    getBytesEncoder() satisfies VariableSizeEncoder<ReadonlyUint8Array | Uint8Array>;
    getBytesEncoder({ size: 'variable' }) satisfies VariableSizeEncoder<ReadonlyUint8Array | Uint8Array>;
    getBytesEncoder({ size: {} as NumberEncoder }) satisfies VariableSizeEncoder<ReadonlyUint8Array | Uint8Array>;
}

{
    // [getBytesDecoder]: It knows if the decoder is fixed size or variable size.
    getBytesDecoder({ size: 42 }) satisfies FixedSizeDecoder<ReadonlyUint8Array, 42>;
    getBytesDecoder() satisfies VariableSizeDecoder<ReadonlyUint8Array>;
    getBytesDecoder({ size: 'variable' }) satisfies VariableSizeDecoder<ReadonlyUint8Array>;
    getBytesDecoder({ size: {} as NumberDecoder }) satisfies VariableSizeDecoder<ReadonlyUint8Array>;
}

{
    // [getBytesCodec]: It knows if the codec is fixed size or variable size.
    getBytesCodec({ size: 42 }) satisfies FixedSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array, 42>;
    getBytesCodec() satisfies VariableSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array>;
    getBytesCodec({ size: 'variable' }) satisfies VariableSizeCodec<
        ReadonlyUint8Array | Uint8Array,
        ReadonlyUint8Array
    >;
    getBytesCodec({ size: {} as NumberCodec }) satisfies VariableSizeCodec<
        ReadonlyUint8Array | Uint8Array,
        ReadonlyUint8Array
    >;
}
