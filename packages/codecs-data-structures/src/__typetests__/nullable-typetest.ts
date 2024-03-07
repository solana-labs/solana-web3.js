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
    getNullableEncoder({} as FixedSizeEncoder<void, 0>) satisfies FixedSizeEncoder<null | void>;
    getNullableEncoder({} as FixedSizeEncoder<string>, { fixed: true }) satisfies FixedSizeEncoder<string | null>;
    getNullableEncoder({} as FixedSizeEncoder<string>) satisfies VariableSizeEncoder<string | null>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getNullableEncoder({} as VariableSizeEncoder<string>, { fixed: true });
}

{
    // [getNullableDecoder]: It knows if the decoder is fixed size or variable size.
    getNullableDecoder({} as FixedSizeDecoder<void, 0>) satisfies FixedSizeDecoder<null | void>;
    getNullableDecoder({} as FixedSizeDecoder<string>, { fixed: true }) satisfies FixedSizeDecoder<string | null>;
    getNullableDecoder({} as FixedSizeDecoder<string>) satisfies VariableSizeDecoder<string | null>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getNullableDecoder({} as VariableSizeDecoder<string>, { fixed: true });
}

{
    // [getNullableCodec]: It knows if the codec is fixed size or variable size.
    getNullableCodec({} as FixedSizeCodec<void, void, 0>) satisfies FixedSizeCodec<null | void>;
    getNullableCodec({} as FixedSizeCodec<string>, { fixed: true }) satisfies FixedSizeCodec<string | null>;
    getNullableCodec({} as FixedSizeCodec<string>) satisfies VariableSizeCodec<string | null>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getNullableCodec({} as VariableSizeCodec<string>, { fixed: true });
}
