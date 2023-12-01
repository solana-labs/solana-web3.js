import { Codec, Decoder, Encoder } from '@solana/codecs-core';

import { getDataEnumCodec, getDataEnumDecoder, getDataEnumEncoder } from '../data-enum';

type Variants = { __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number };

{
    // [getDataEnumEncoder]: It constructs data enums from a list of encoder variants.
    getDataEnumEncoder([
        ['A', {} as Encoder<{ value: string }>],
        ['B', {} as Encoder<{ x: number; y: number }>],
    ]) satisfies Encoder<Variants>;
}

{
    // [getDataEnumDecoder]: It constructs data enums from a list of decoder variants.
    getDataEnumDecoder([
        ['A', {} as Decoder<{ value: string }>],
        ['B', {} as Decoder<{ x: number; y: number }>],
    ]) satisfies Decoder<Variants>;
}

{
    // [getDataEnumCodec]: It constructs data enums from a list of codec variants.
    getDataEnumCodec([
        ['A', {} as Codec<{ value: string }>],
        ['B', {} as Codec<{ x: number; y: number }>],
    ]) satisfies Codec<Variants>;
}
