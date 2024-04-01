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

import { getHiddenSuffixCodec, getHiddenSuffixDecoder, getHiddenSuffixEncoder } from '../hidden-suffix';

{
    // [getHiddenSuffixEncoder]: It knows if the encoder is fixed size or variable size.
    getHiddenSuffixEncoder(
        {} as FixedSizeEncoder<string>,
        [] as FixedSizeEncoder<void>[],
    ) satisfies FixedSizeEncoder<string>;
    getHiddenSuffixEncoder({} as Encoder<string>, [] as FixedSizeEncoder<void>[]) satisfies VariableSizeEncoder<string>;
    getHiddenSuffixEncoder({} as FixedSizeEncoder<string>, [] as Encoder<void>[]) satisfies VariableSizeEncoder<string>;
}

{
    // [getHiddenSuffixDecoder]: It knows if the decoder is fixed size or variable size.
    getHiddenSuffixDecoder(
        {} as FixedSizeDecoder<string>,
        [] as FixedSizeDecoder<void>[],
    ) satisfies FixedSizeDecoder<string>;
    getHiddenSuffixDecoder({} as Decoder<string>, [] as FixedSizeDecoder<void>[]) satisfies VariableSizeDecoder<string>;
    getHiddenSuffixDecoder({} as FixedSizeDecoder<string>, [] as Decoder<void>[]) satisfies VariableSizeDecoder<string>;
}

{
    // [getHiddenSuffixCodec]: It knows if the codec is fixed size or variable size.
    getHiddenSuffixCodec({} as FixedSizeCodec<string>, [] as FixedSizeCodec<void>[]) satisfies FixedSizeCodec<string>;
    getHiddenSuffixCodec({} as Codec<string>, [] as FixedSizeCodec<void>[]) satisfies VariableSizeCodec<string>;
    getHiddenSuffixCodec({} as FixedSizeCodec<string>, [] as Codec<void>[]) satisfies VariableSizeCodec<string>;
}
