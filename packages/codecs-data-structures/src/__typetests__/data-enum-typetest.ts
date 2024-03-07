import { Codec, Decoder, Encoder } from '@solana/codecs-core';
import { getU64Codec } from '@solana/codecs-numbers';

import { getDataEnumCodec, getDataEnumDecoder, getDataEnumEncoder } from '../data-enum';
import { getStructCodec } from '../struct';
import { getUnitCodec } from '../unit';

{
    // [getDataEnumEncoder]: It constructs data enums from a list of encoder variants.
    getDataEnumEncoder([
        ['A', {} as Encoder<{ value: string }>],
        ['B', {} as Encoder<{ x: number; y: number }>],
    ]) satisfies Encoder<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
}

{
    // [getDataEnumDecoder]: It constructs data enums from a list of decoder variants.
    getDataEnumDecoder([
        ['A', {} as Decoder<{ value: string }>],
        ['B', {} as Decoder<{ x: number; y: number }>],
    ]) satisfies Decoder<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
}

{
    // [getDataEnumCodec]: It constructs data enums from a list of codec variants.
    getDataEnumCodec([
        ['A', {} as Codec<{ value: string }>],
        ['B', {} as Codec<{ x: number; y: number }>],
    ]) satisfies Codec<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
}

{
    // [getDataEnumCodec]: It can infer complex data enum types from provided variants.
    getDataEnumCodec([
        ['PageLoad', {} as Codec<void>],
        [
            'Click',
            getStructCodec([
                ['x', {} as Codec<number>],
                ['y', {} as Codec<number>],
            ]),
        ],
        ['KeyPress', getStructCodec([['fields', {} as Codec<[string]>]])],
        ['PageUnload', {} as Codec<object>],
    ]) satisfies Codec<
        | { __kind: 'Click'; x: number; y: number }
        | { __kind: 'KeyPress'; fields: [string] }
        | { __kind: 'PageLoad' }
        | { __kind: 'PageUnload' }
    >;
}

{
    // [getDataEnumCodec]: It can infer codec data enum with different from and to types.
    getDataEnumCodec([
        ['A', getUnitCodec()],
        ['B', getStructCodec([['value', getU64Codec()]])],
    ]) satisfies Codec<
        { __kind: 'A' } | { __kind: 'B'; value: bigint | number },
        { __kind: 'A' } | { __kind: 'B'; value: bigint }
    >;
}
