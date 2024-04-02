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
import { fixCodecSize, fixDecoderSize, fixEncoderSize } from '../fix-codec-size';

{
    // [fixEncoderSize]: It transforms any encoder into a fixed size encoder.
    fixEncoderSize({} as FixedSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
    fixEncoderSize({} as VariableSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
    fixEncoderSize({} as Encoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
}

{
    // [fixDecoderSize]: It transforms any decoder into a fixed size decoder.
    fixDecoderSize({} as FixedSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
    fixDecoderSize({} as VariableSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
    fixDecoderSize({} as Decoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
}

{
    // [fixCodecSize]: It transforms any codec into a fixed size codec.
    fixCodecSize({} as FixedSizeCodec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
    fixCodecSize({} as VariableSizeCodec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
    fixCodecSize({} as Codec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
}
