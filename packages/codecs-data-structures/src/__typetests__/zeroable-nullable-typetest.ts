import { FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { getZeroableNullableCodec, getZeroableNullableDecoder, getZeroableNullableEncoder } from '../zeroable-nullable';

{
    // [getZeroableNullableEncoder]: It returns a fixed-size encoder of the same size as the provided item.
    getZeroableNullableEncoder({} as FixedSizeEncoder<string, 42>) satisfies FixedSizeEncoder<string | null, 42>;
}

{
    // [getZeroableNullableDecoder]: It returns a fixed-size decoder of the same size as the provided item.
    getZeroableNullableDecoder({} as FixedSizeDecoder<string, 42>) satisfies FixedSizeDecoder<string | null, 42>;
}

{
    // [getZeroableNullableCodec]: It returns a fixed-size Codec of the same size as the provided item.
    getZeroableNullableCodec({} as FixedSizeCodec<string, string, 42>) satisfies FixedSizeCodec<
        string | null,
        string | null,
        42
    >;
}
