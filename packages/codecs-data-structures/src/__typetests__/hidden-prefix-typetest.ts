import {
    Codec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { getHiddenPrefixCodec, getHiddenPrefixDecoder, getHiddenPrefixEncoder } from '../hidden-prefix';

{
    // [getHiddenPrefixEncoder]: It knows if the encoder is fixed size or variable size.
    getHiddenPrefixEncoder(
        {} as FixedSizeEncoder<string>,
        [] as FixedSizeEncoder<void>[],
    ) satisfies FixedSizeEncoder<string>;
    getHiddenPrefixEncoder({} as Encoder<string>, [] as FixedSizeEncoder<void>[]) satisfies VariableSizeEncoder<string>;
    getHiddenPrefixEncoder({} as FixedSizeEncoder<string>, [] as Encoder<void>[]) satisfies VariableSizeEncoder<string>;
}

{
    // [getHiddenPrefixDecoder]: It knows if the decoder is fixed size or variable size.
    getHiddenPrefixDecoder(
        {} as FixedSizeDecoder<string>,
        [] as FixedSizeDecoder<void>[],
    ) satisfies FixedSizeDecoder<string>;
    getHiddenPrefixDecoder({} as Decoder<string>, [] as FixedSizeDecoder<void>[]) satisfies VariableSizeDecoder<string>;
    getHiddenPrefixDecoder({} as FixedSizeDecoder<string>, [] as Decoder<void>[]) satisfies VariableSizeDecoder<string>;
}

{
    // [getHiddenPrefixCodec]: It knows if the codec is fixed size or variable size.
    getHiddenPrefixCodec({} as FixedSizeCodec<string>, [] as FixedSizeCodec<void>[]) satisfies FixedSizeCodec<string>;
    getHiddenPrefixCodec({} as Codec<string>, [] as FixedSizeCodec<void>[]) satisfies VariableSizeCodec<string>;
    getHiddenPrefixCodec({} as FixedSizeCodec<string>, [] as Codec<void>[]) satisfies VariableSizeCodec<string>;
}
