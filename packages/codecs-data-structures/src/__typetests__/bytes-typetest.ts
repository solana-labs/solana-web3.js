import { ReadonlyUint8Array, VariableSizeCodec, VariableSizeDecoder, VariableSizeEncoder } from '@solana/codecs-core';

import { getBytesCodec, getBytesDecoder, getBytesEncoder } from '../bytes';

{
    // [getBytesEncoder]: It always returns a variable size encoder.
    getBytesEncoder() satisfies VariableSizeEncoder<ReadonlyUint8Array | Uint8Array>;
}

{
    // [getBytesDecoder]: It always returns a variable size decoder.
    getBytesDecoder() satisfies VariableSizeDecoder<ReadonlyUint8Array>;
}

{
    // [getBytesCodec]: It always returns a variable size codec.
    getBytesCodec() satisfies VariableSizeCodec<ReadonlyUint8Array | Uint8Array, ReadonlyUint8Array>;
}
