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
} from '../codec';
import { transformCodec, transformDecoder, transformEncoder } from '../transform-codec';

{
    // [transformEncoder]: It keeps track of the nested encoder's size.
    transformEncoder({} as FixedSizeEncoder<string, 42>, (_: number) => '42') satisfies FixedSizeEncoder<number, 42>;
    transformEncoder({} as VariableSizeEncoder<string>, (_: number) => '42') satisfies VariableSizeEncoder<number>;
    transformEncoder({} as Encoder<string>, (_: number) => '42') satisfies Encoder<number>;
}

{
    // [transformDecoder]: It keeps track of the nested decoder's size.
    transformDecoder({} as FixedSizeDecoder<string, 42>, (_: string) => 42) satisfies FixedSizeDecoder<number, 42>;
    transformDecoder({} as VariableSizeDecoder<string>, (_: string) => 42) satisfies VariableSizeDecoder<number>;
    transformDecoder({} as Decoder<string>, (_: string) => 42) satisfies Decoder<number>;
}

{
    // [transformCodec]: It keeps track of the nested codec's size.
    transformCodec(
        {} as FixedSizeCodec<string, string, 42>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies FixedSizeCodec<number, number, 42>;
    transformCodec(
        {} as VariableSizeCodec<string>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies VariableSizeCodec<number>;
    transformCodec(
        {} as Codec<string>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies Codec<number>;
}
