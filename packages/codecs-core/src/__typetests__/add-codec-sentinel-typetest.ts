import { addCodecSentinel, addDecoderSentinel, addEncoderSentinel } from '../add-codec-sentinel';
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

const sentinel = {} as Uint8Array;

{
    // [addEncoderSentinel]: It knows if the encoder is fixed size or variable size.
    addEncoderSentinel({} as FixedSizeEncoder<string>, sentinel) satisfies FixedSizeEncoder<string>;
    addEncoderSentinel({} as VariableSizeEncoder<string>, sentinel) satisfies VariableSizeEncoder<string>;
    addEncoderSentinel({} as Encoder<string>, sentinel) satisfies VariableSizeEncoder<string>;
}

{
    // [addDecoderSentinel]: It knows if the decoder is fixed size or variable size.
    addDecoderSentinel({} as FixedSizeDecoder<string>, sentinel) satisfies FixedSizeDecoder<string>;
    addDecoderSentinel({} as VariableSizeDecoder<string>, sentinel) satisfies VariableSizeDecoder<string>;
    addDecoderSentinel({} as Decoder<string>, sentinel) satisfies VariableSizeDecoder<string>;
}

{
    // [addCodecSentinel]: It knows if the codec is fixed size or variable size.
    addCodecSentinel({} as FixedSizeCodec<string>, sentinel) satisfies FixedSizeCodec<string>;
    addCodecSentinel({} as VariableSizeCodec<string>, sentinel) satisfies VariableSizeCodec<string>;
    addCodecSentinel({} as Codec<string>, sentinel) satisfies VariableSizeCodec<string>;
}
