import { FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { Option, OptionOrNullable } from '../option';
import { getZeroableOptionCodec, getZeroableOptionDecoder, getZeroableOptionEncoder } from '../zeroable-option-codec';

{
    // [getZeroableOptionEncoder]: It returns a fixed-size encoder of the same size as the provided item.
    getZeroableOptionEncoder({} as FixedSizeEncoder<string, 42>) satisfies FixedSizeEncoder<
        OptionOrNullable<string>,
        42
    >;
}

{
    // [getZeroableOptionDecoder]: It returns a fixed-size decoder of the same size as the provided item.
    getZeroableOptionDecoder({} as FixedSizeDecoder<string, 42>) satisfies FixedSizeDecoder<Option<string>, 42>;
}

{
    // [getZeroableOptionCodec]: It returns a fixed-size Codec of the same size as the provided item.
    getZeroableOptionCodec({} as FixedSizeCodec<string, string, 42>) satisfies FixedSizeCodec<
        OptionOrNullable<string>,
        Option<string>,
        42
    >;
}
