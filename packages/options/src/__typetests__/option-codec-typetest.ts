import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { Option, OptionOrNullable } from '../option';
import { getOptionCodec, getOptionDecoder, getOptionEncoder } from '../option-codec';

{
    // [getOptionEncoder]: It knows if the encoder is fixed size or variable size.
    getOptionEncoder({} as FixedSizeEncoder<string>, { noneValue: 'zeroes' }) satisfies FixedSizeEncoder<
        OptionOrNullable<string>
    >;
    getOptionEncoder({} as FixedSizeEncoder<string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeEncoder<OptionOrNullable<string>, 42>;
    getOptionEncoder({} as FixedSizeEncoder<string>) satisfies VariableSizeEncoder<OptionOrNullable<string>>;
}

{
    // [getOptionDecoder]: It knows if the decoder is fixed size or variable size.
    getOptionDecoder({} as FixedSizeDecoder<string>, { noneValue: 'zeroes' }) satisfies FixedSizeDecoder<
        Option<string>
    >;
    getOptionDecoder({} as FixedSizeDecoder<string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeDecoder<Option<string>, 42>;
    getOptionDecoder({} as FixedSizeDecoder<string>) satisfies VariableSizeDecoder<Option<string>>;
}

{
    // [getOptionCodec]: It knows if the codec is fixed size or variable size.
    getOptionCodec({} as FixedSizeCodec<string>, { noneValue: 'zeroes' }) satisfies FixedSizeCodec<
        OptionOrNullable<string>,
        Option<string>
    >;
    getOptionCodec({} as FixedSizeCodec<string, string, 42>, {
        noneValue: 'zeroes',
        prefix: null,
    }) satisfies FixedSizeCodec<OptionOrNullable<string>, Option<string>, 42>;
    getOptionCodec({} as FixedSizeCodec<string>) satisfies VariableSizeCodec<OptionOrNullable<string>, Option<string>>;
}
