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
import { prefixCodec, prefixDecoder, prefixEncoder } from '../prefix-codec';

const u32Encoder = {} as FixedSizeEncoder<number, 4>;
const u32Decoder = {} as FixedSizeDecoder<number, 4>;
const u32Codec = {} as FixedSizeCodec<number, number, 4>;

const shortU16Encoder = {} as VariableSizeEncoder<number>;
const shortU16Decoder = {} as VariableSizeDecoder<number>;
const shortU16Codec = {} as VariableSizeCodec<number>;

{
    // [prefixEncoder]: It knows if the encoder is fixed size or variable size.
    prefixEncoder({} as FixedSizeEncoder<string>, u32Encoder) satisfies FixedSizeEncoder<string>;
    prefixEncoder({} as VariableSizeEncoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoder({} as Encoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoder({} as FixedSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoder({} as VariableSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoder({} as Encoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
}

{
    // [prefixDecoder]: It knows if the decoder is fixed size or variable size.
    prefixDecoder({} as FixedSizeDecoder<string>, u32Decoder) satisfies FixedSizeDecoder<string>;
    prefixDecoder({} as VariableSizeDecoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoder({} as Decoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoder({} as FixedSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoder({} as VariableSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoder({} as Decoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
}

{
    // [prefixCodec]: It knows if the codec is fixed size or variable size.
    prefixCodec({} as FixedSizeCodec<string>, u32Codec) satisfies FixedSizeCodec<string>;
    prefixCodec({} as VariableSizeCodec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    prefixCodec({} as Codec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    prefixCodec({} as FixedSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    prefixCodec({} as VariableSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    prefixCodec({} as Codec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
}
