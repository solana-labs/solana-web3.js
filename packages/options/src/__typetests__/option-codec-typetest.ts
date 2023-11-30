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
    getOptionEncoder({} as FixedSizeEncoder<void, 0>) satisfies FixedSizeEncoder<OptionOrNullable<void>>;
    getOptionEncoder({} as FixedSizeEncoder<string>, { fixed: true }) satisfies FixedSizeEncoder<
        OptionOrNullable<string>
    >;
    getOptionEncoder({} as FixedSizeEncoder<string>) satisfies VariableSizeEncoder<OptionOrNullable<string>>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getOptionEncoder({} as VariableSizeEncoder<string>, { fixed: true });
}

{
    // [getOptionDecoder]: It knows if the decoder is fixed size or variable size.
    getOptionDecoder({} as FixedSizeDecoder<void, 0>) satisfies FixedSizeDecoder<Option<void>>;
    getOptionDecoder({} as FixedSizeDecoder<string>, { fixed: true }) satisfies FixedSizeDecoder<Option<string>>;
    getOptionDecoder({} as FixedSizeDecoder<string>) satisfies VariableSizeDecoder<Option<string>>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getOptionDecoder({} as VariableSizeDecoder<string>, { fixed: true });
}

{
    // [getOptionCodec]: It knows if the codec is fixed size or variable size.
    getOptionCodec({} as FixedSizeCodec<void, void, 0>) satisfies FixedSizeCodec<OptionOrNullable<void>, Option<void>>;
    getOptionCodec({} as FixedSizeCodec<string>, { fixed: true }) satisfies FixedSizeCodec<
        OptionOrNullable<string>,
        Option<string>
    >;
    getOptionCodec({} as FixedSizeCodec<string>) satisfies VariableSizeCodec<OptionOrNullable<string>, Option<string>>;

    // @ts-expect-error It cannot be fixed when using a variable size item.
    getOptionCodec({} as VariableSizeCodec<string>, { fixed: true });
}
