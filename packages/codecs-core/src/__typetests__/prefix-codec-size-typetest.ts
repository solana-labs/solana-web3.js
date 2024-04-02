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
import { prefixCodecSize, prefixDecoderSize, prefixEncoderSize } from '../prefix-codec-size';

const u32Encoder = {} as FixedSizeEncoder<number, 4>;
const u32Decoder = {} as FixedSizeDecoder<number, 4>;
const u32Codec = {} as FixedSizeCodec<number, number, 4>;

const shortU16Encoder = {} as VariableSizeEncoder<number>;
const shortU16Decoder = {} as VariableSizeDecoder<number>;
const shortU16Codec = {} as VariableSizeCodec<number>;

{
    // [prefixEncoderSize]: It knows if the encoder is fixed size or variable size.
    prefixEncoderSize({} as FixedSizeEncoder<string>, u32Encoder) satisfies FixedSizeEncoder<string>;
    prefixEncoderSize({} as VariableSizeEncoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoderSize({} as Encoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoderSize({} as FixedSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoderSize({} as VariableSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    prefixEncoderSize({} as Encoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
}

{
    // [prefixDecoderSize]: It knows if the decoder is fixed size or variable size.
    prefixDecoderSize({} as FixedSizeDecoder<string>, u32Decoder) satisfies FixedSizeDecoder<string>;
    prefixDecoderSize({} as VariableSizeDecoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoderSize({} as Decoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoderSize({} as FixedSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoderSize({} as VariableSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    prefixDecoderSize({} as Decoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
}

{
    // [prefixCodecSize]: It knows if the codec is fixed size or variable size.
    prefixCodecSize({} as FixedSizeCodec<string>, u32Codec) satisfies FixedSizeCodec<string>;
    prefixCodecSize({} as VariableSizeCodec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    prefixCodecSize({} as Codec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    prefixCodecSize({} as FixedSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    prefixCodecSize({} as VariableSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    prefixCodecSize({} as Codec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
}
