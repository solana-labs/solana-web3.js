import { addCodecSizePrefix, addDecoderSizePrefix, addEncoderSizePrefix } from '../add-codec-size-prefix';
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

const u32Encoder = {} as FixedSizeEncoder<number, 4>;
const u32Decoder = {} as FixedSizeDecoder<number, 4>;
const u32Codec = {} as FixedSizeCodec<number, number, 4>;

const shortU16Encoder = {} as VariableSizeEncoder<number>;
const shortU16Decoder = {} as VariableSizeDecoder<number>;
const shortU16Codec = {} as VariableSizeCodec<number>;

{
    // [addEncoderSizePrefix]: It knows if the encoder is fixed size or variable size.
    addEncoderSizePrefix({} as FixedSizeEncoder<string>, u32Encoder) satisfies FixedSizeEncoder<string>;
    addEncoderSizePrefix({} as VariableSizeEncoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    addEncoderSizePrefix({} as Encoder<string>, u32Encoder) satisfies VariableSizeEncoder<string>;
    addEncoderSizePrefix({} as FixedSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    addEncoderSizePrefix({} as VariableSizeEncoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
    addEncoderSizePrefix({} as Encoder<string>, shortU16Encoder) satisfies VariableSizeEncoder<string>;
}

{
    // [addDecoderSizePrefix]: It knows if the decoder is fixed size or variable size.
    addDecoderSizePrefix({} as FixedSizeDecoder<string>, u32Decoder) satisfies FixedSizeDecoder<string>;
    addDecoderSizePrefix({} as VariableSizeDecoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    addDecoderSizePrefix({} as Decoder<string>, u32Decoder) satisfies VariableSizeDecoder<string>;
    addDecoderSizePrefix({} as FixedSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    addDecoderSizePrefix({} as VariableSizeDecoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
    addDecoderSizePrefix({} as Decoder<string>, shortU16Decoder) satisfies VariableSizeDecoder<string>;
}

{
    // [addCodecSizePrefix]: It knows if the codec is fixed size or variable size.
    addCodecSizePrefix({} as FixedSizeCodec<string>, u32Codec) satisfies FixedSizeCodec<string>;
    addCodecSizePrefix({} as VariableSizeCodec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    addCodecSizePrefix({} as Codec<string>, u32Codec) satisfies VariableSizeCodec<string>;
    addCodecSizePrefix({} as FixedSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    addCodecSizePrefix({} as VariableSizeCodec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
    addCodecSizePrefix({} as Codec<string>, shortU16Codec) satisfies VariableSizeCodec<string>;
}
