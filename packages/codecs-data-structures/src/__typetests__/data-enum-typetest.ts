import { Codec, Decoder, Encoder } from '@solana/codecs-core';
import { getU64Codec } from '@solana/codecs-numbers';

import { getDataEnumCodec, getDataEnumDecoder, getDataEnumEncoder } from '../data-enum';
import { getStructCodec } from '../struct';
import { getUnitCodec } from '../unit';

// [DESCRIBE] getDataEnumEncoder.
{
    // It constructs data enums from a list of encoder variants.
    {
        getDataEnumEncoder([
            ['A', {} as Encoder<{ value: string }>],
            ['B', {} as Encoder<{ x: number; y: number }>],
        ]) satisfies Encoder<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
    }

    // It can use a custom discriminator property.
    {
        getDataEnumEncoder(
            [
                ['A', {} as Encoder<{ value: string }>],
                ['B', {} as Encoder<{ x: number; y: number }>],
            ],
            { discriminator: 'myType' },
        ) satisfies Encoder<{ myType: 'A'; value: string } | { myType: 'B'; x: number; y: number }>;
    }

    // It can use numbers as discriminator values.
    {
        getDataEnumEncoder([
            [1, {} as Encoder<{ value: string }>],
            [2, {} as Encoder<{ x: number; y: number }>],
        ]) satisfies Encoder<{ __kind: 1; value: string } | { __kind: 2; x: number; y: number }>;
    }

    // It can use enums as discriminator values.
    {
        const enum Event {
            Click,
            KeyPress,
        }
        getDataEnumEncoder([
            [Event.Click, {} as Encoder<{ x: number; y: number }>],
            [Event.KeyPress, {} as Encoder<{ key: string }>],
        ]) satisfies Encoder<{ __kind: Event.Click; x: number; y: number } | { __kind: Event.KeyPress; key: string }>;
    }
}

// [DESCRIBE] getDataEnumDecoder.
{
    // It constructs data enums from a list of decoder variants.
    {
        getDataEnumDecoder([
            ['A', {} as Decoder<{ value: string }>],
            ['B', {} as Decoder<{ x: number; y: number }>],
        ]) satisfies Decoder<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
    }

    // It can use a custom discriminator property.
    {
        getDataEnumDecoder(
            [
                ['A', {} as Decoder<{ value: string }>],
                ['B', {} as Decoder<{ x: number; y: number }>],
            ],
            { discriminator: 'myType' },
        ) satisfies Decoder<{ myType: 'A'; value: string } | { myType: 'B'; x: number; y: number }>;
    }

    // It can use numbers as discriminator values.
    {
        getDataEnumDecoder([
            [1, {} as Decoder<{ value: string }>],
            [2, {} as Decoder<{ x: number; y: number }>],
        ]) satisfies Decoder<{ __kind: 1; value: string } | { __kind: 2; x: number; y: number }>;
    }

    // It can use enums as discriminator values.
    {
        const enum Event {
            Click,
            KeyPress,
        }
        getDataEnumDecoder([
            [Event.Click, {} as Decoder<{ x: number; y: number }>],
            [Event.KeyPress, {} as Decoder<{ key: string }>],
        ]) satisfies Decoder<{ __kind: Event.Click; x: number; y: number } | { __kind: Event.KeyPress; key: string }>;
    }
}

// [DESCRIBE] getDataEnumCodec.
{
    // It constructs data enums from a list of codec variants.
    {
        getDataEnumCodec([
            ['A', {} as Codec<{ value: string }>],
            ['B', {} as Codec<{ x: number; y: number }>],
        ]) satisfies Codec<{ __kind: 'A'; value: string } | { __kind: 'B'; x: number; y: number }>;
    }

    // It can use a custom discriminator property.
    {
        getDataEnumCodec(
            [
                ['A', {} as Codec<{ value: string }>],
                ['B', {} as Codec<{ x: number; y: number }>],
            ],
            { discriminator: 'myType' },
        ) satisfies Codec<{ myType: 'A'; value: string } | { myType: 'B'; x: number; y: number }>;
    }

    // It can use numbers as discriminator values.
    {
        getDataEnumCodec([
            [1, {} as Codec<{ value: string }>],
            [2, {} as Codec<{ x: number; y: number }>],
        ]) satisfies Codec<{ __kind: 1; value: string } | { __kind: 2; x: number; y: number }>;
    }

    // It can use enums as discriminator values.
    {
        const enum Event {
            Click,
            KeyPress,
        }
        getDataEnumCodec([
            [Event.Click, {} as Codec<{ x: number; y: number }>],
            [Event.KeyPress, {} as Codec<{ key: string }>],
        ]) satisfies Codec<{ __kind: Event.Click; x: number; y: number } | { __kind: Event.KeyPress; key: string }>;
    }

    // It can infer complex data enum types from provided variants.
    {
        getDataEnumCodec(
            [
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
            ],
            { discriminator: 'event' },
        ) satisfies Codec<
            | { event: 'Click'; x: number; y: number }
            | { event: 'KeyPress'; fields: [string] }
            | { event: 'PageLoad' }
            | { event: 'PageUnload' }
        >;
    }

    // It can infer codec data enum with different from and to types.
    {
        getDataEnumCodec([
            ['A', getUnitCodec()],
            ['B', getStructCodec([['value', getU64Codec()]])],
        ]) satisfies Codec<
            { __kind: 'A' } | { __kind: 'B'; value: bigint | number },
            { __kind: 'A' } | { __kind: 'B'; value: bigint }
        >;
    }
}
