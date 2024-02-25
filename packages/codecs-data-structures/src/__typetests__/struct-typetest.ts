import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { getU32Codec, getU32Decoder, getU32Encoder } from '@solana/codecs-numbers';
import { getStringCodec, getStringDecoder, getStringEncoder } from '@solana/codecs-strings';

import { getStructCodec, getStructDecoder, getStructEncoder } from '../struct';

{
    // [getStructEncoder]: It knows if the encoder is fixed size or variable size.
    getStructEncoder([
        ['name', {} as FixedSizeEncoder<string>],
        ['age', {} as FixedSizeEncoder<number>],
    ]) satisfies FixedSizeEncoder<{ name: string; age: number }>;
    getStructEncoder([
        ['name', {} as VariableSizeEncoder<string>],
        ['age', {} as FixedSizeEncoder<number>],
    ]) satisfies VariableSizeEncoder<{ name: string; age: number }>;
    getStructEncoder([['age', getU32Encoder()]]) satisfies FixedSizeEncoder<{ age: number }>;
    getStructEncoder([['name', getStringEncoder()]]) satisfies VariableSizeEncoder<{ name: string }>;
}

{
    // [getStructDecoder]: It knows if the decoder is fixed size or variable size.
    getStructDecoder([
        ['name', {} as FixedSizeDecoder<string>],
        ['age', {} as FixedSizeDecoder<number>],
    ]) satisfies FixedSizeDecoder<{ name: string; age: number }>;
    getStructDecoder([
        ['name', {} as VariableSizeDecoder<string>],
        ['age', {} as FixedSizeDecoder<number>],
    ]) satisfies VariableSizeDecoder<{ name: string; age: number }>;
    getStructDecoder([['age', getU32Decoder()]]) satisfies FixedSizeDecoder<{ age: number }>;
    getStructDecoder([['name', getStringDecoder()]]) satisfies VariableSizeDecoder<{ name: string }>;
}

{
    // [getStructCodec]: It knows if the codec is fixed size or variable size.
    getStructCodec([
        ['name', {} as FixedSizeCodec<string>],
        ['age', {} as FixedSizeCodec<number>],
    ]) satisfies FixedSizeCodec<{ name: string; age: number }>;
    getStructCodec([
        ['name', {} as VariableSizeCodec<string>],
        ['age', {} as FixedSizeCodec<number>],
    ]) satisfies VariableSizeCodec<{ name: string; age: number }>;
    getStructCodec([['age', getU32Codec()]]) satisfies FixedSizeCodec<{ age: number }>;
    getStructCodec([['name', getStringCodec()]]) satisfies VariableSizeCodec<{ name: string }>;
}

{
    // [getStructEncoder]: It can infer complex struct types from fields.
    getStructEncoder([
        ['name', {} as VariableSizeEncoder<string>],
        ['id', {} as FixedSizeEncoder<number | bigint>],
        [
            'address',
            getStructEncoder([
                ['street', {} as VariableSizeEncoder<string>],
                ['city', {} as VariableSizeEncoder<string>],
                ['country', {} as VariableSizeEncoder<string>],
            ]),
        ],
    ]) satisfies VariableSizeEncoder<{
        name: string;
        id: number | bigint;
        address: { street: string; city: string; country: string };
    }>;
}

{
    // [getStructDecoder]: It can infer complex struct types from fields.
    getStructDecoder([
        ['name', {} as VariableSizeDecoder<string>],
        ['id', {} as FixedSizeDecoder<bigint>],
        [
            'address',
            getStructDecoder([
                ['street', {} as VariableSizeDecoder<string>],
                ['city', {} as VariableSizeDecoder<string>],
                ['country', {} as VariableSizeDecoder<string>],
            ]),
        ],
    ]) satisfies VariableSizeDecoder<{
        name: string;
        id: bigint;
        address: { street: string; city: string; country: string };
    }>;
}

{
    // [getStructCodec]: It can infer complex struct types from fields.
    getStructCodec([
        ['name', {} as VariableSizeCodec<string>],
        ['id', {} as FixedSizeCodec<number | bigint, bigint>],
        [
            'address',
            getStructCodec([
                ['street', {} as VariableSizeCodec<string>],
                ['city', {} as VariableSizeCodec<string>],
                ['country', {} as VariableSizeCodec<string>],
            ]),
        ],
    ]) satisfies VariableSizeCodec<
        {
            name: string;
            id: number | bigint;
            address: { street: string; city: string; country: string };
        },
        {
            name: string;
            id: bigint;
            address: { street: string; city: string; country: string };
        }
    >;
}
