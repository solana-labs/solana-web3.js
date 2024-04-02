import { Codec, Decoder, Encoder } from '@solana/codecs-core';

import { getUnionCodec, getUnionDecoder, getUnionEncoder } from '../union';

const getIndex = () => 0;

// [getUnionEncoder] It constructs unions from a list of encoder variants.
{
    getUnionEncoder(
        [
            {} as Encoder<null>,
            {} as Encoder<bigint | number>,
            {} as Encoder<{ value: string }>,
            {} as Encoder<{ x: number; y: number }>,
        ],
        getIndex,
    ) satisfies Encoder<bigint | number | { value: string } | { x: number; y: number } | null>;
}

// [getUnionDecoder] It constructs unions from a list of decoder variants.
{
    getUnionDecoder(
        [
            {} as Decoder<null>,
            {} as Decoder<bigint | number>,
            {} as Decoder<{ value: string }>,
            {} as Decoder<{ x: number; y: number }>,
        ],
        getIndex,
    ) satisfies Decoder<bigint | number | { value: string } | { x: number; y: number } | null>;
}

// [getUnionCodec] It constructs unions from a list of codec variants.
{
    getUnionCodec(
        [
            {} as Codec<null>,
            {} as Codec<bigint | number>,
            {} as Codec<{ value: string }>,
            {} as Codec<{ x: number; y: number }>,
        ],
        getIndex,
        getIndex,
    ) satisfies Codec<bigint | number | { value: string } | { x: number; y: number } | null>;
}
