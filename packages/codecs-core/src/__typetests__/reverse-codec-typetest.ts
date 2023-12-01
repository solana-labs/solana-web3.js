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
import { reverseCodec, reverseDecoder, reverseEncoder } from '../reverse-codec';

{
    // [reverseEncoder]: It only works with fixed size encoders.
    reverseEncoder({} as FixedSizeEncoder<string, 42>) satisfies FixedSizeEncoder<string, 42>;
    // @ts-expect-error Expected a fixed size encoder.
    reverseEncoder({} as VariableSizeEncoder<string>);
    // @ts-expect-error Expected a fixed size encoder.
    reverseEncoder({} as Encoder<string>);
}

{
    // [reverseDecoder]: It only works with fixed size decoders.
    reverseDecoder({} as FixedSizeDecoder<string, 42>) satisfies FixedSizeDecoder<string, 42>;
    // @ts-expect-error Expected a fixed size decoder.
    reverseDecoder({} as VariableSizeDecoder<string>);
    // @ts-expect-error Expected a fixed size decoder.
    reverseDecoder({} as Decoder<string>);
}

{
    // [reverseCodec]: It only works with fixed size codecs.
    reverseCodec({} as FixedSizeCodec<string, string, 42>) satisfies FixedSizeCodec<string, string, 42>;
    // @ts-expect-error Expected a fixed size codec.
    reverseCodec({} as VariableSizeCodec<string>);
    // @ts-expect-error Expected a fixed size codec.
    reverseCodec({} as Codec<string>);
}
