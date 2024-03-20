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
} from '../codec.js';
import { mapCodec, mapDecoder, mapEncoder } from '../map-codec.js';

{
    // [mapEncoder]: It keeps track of the nested encoder's size.
    mapEncoder({} as FixedSizeEncoder<string, 42>, (_: number) => '42') satisfies FixedSizeEncoder<number, 42>;
    mapEncoder({} as VariableSizeEncoder<string>, (_: number) => '42') satisfies VariableSizeEncoder<number>;
    mapEncoder({} as Encoder<string>, (_: number) => '42') satisfies Encoder<number>;
}

{
    // [mapDecoder]: It keeps track of the nested decoder's size.
    mapDecoder({} as FixedSizeDecoder<string, 42>, (_: string) => 42) satisfies FixedSizeDecoder<number, 42>;
    mapDecoder({} as VariableSizeDecoder<string>, (_: string) => 42) satisfies VariableSizeDecoder<number>;
    mapDecoder({} as Decoder<string>, (_: string) => 42) satisfies Decoder<number>;
}

{
    // [mapCodec]: It keeps track of the nested codec's size.
    mapCodec(
        {} as FixedSizeCodec<string, string, 42>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies FixedSizeCodec<number, number, 42>;
    mapCodec(
        {} as VariableSizeCodec<string>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies VariableSizeCodec<number>;
    mapCodec(
        {} as Codec<string>,
        (_: number) => '42',
        (_: string) => 42,
    ) satisfies Codec<number>;
}
