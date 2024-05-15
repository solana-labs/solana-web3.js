import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { getNullableCodec, getNullableDecoder, getNullableEncoder } from '../nullable';

{
    // [getNullableEncoder]: It knows if the encoder is fixed size or variable size.
    getNullableEncoder({} as FixedSizeEncoder<string>, { noneValue: 'zeroes' }) satisfies FixedSizeEncoder<
        string | null
    >;
    getNullableEncoder({} as FixedSizeEncoder<string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeEncoder<string | null, 42>;
    getNullableEncoder({} as FixedSizeEncoder<string>) satisfies VariableSizeEncoder<string | null>;
}

{
    // [getNullableDecoder]: It knows if the decoder is fixed size or variable size.
    getNullableDecoder({} as FixedSizeDecoder<string>, { noneValue: 'zeroes' }) satisfies FixedSizeDecoder<
        string | null
    >;
    getNullableDecoder({} as FixedSizeDecoder<string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeDecoder<string | null, 42>;
    getNullableDecoder({} as FixedSizeDecoder<string>) satisfies VariableSizeDecoder<string | null>;
}

{
    // [getNullableCodec]: It knows if the codec is fixed size or variable size.
    getNullableCodec({} as FixedSizeCodec<string>, { noneValue: 'zeroes' }) satisfies FixedSizeCodec<string | null>;
    getNullableCodec({} as FixedSizeCodec<string, string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeCodec<string | null, string | null, 42>;
    getNullableCodec({} as FixedSizeCodec<string>) satisfies VariableSizeCodec<string | null>;
}
