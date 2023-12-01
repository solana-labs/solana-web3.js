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
import { fixCodec, fixDecoder, fixEncoder } from '../fix-codec';

{
    // [fixEncoder]: It transforms any encoder into a fixed size encoder.
    fixEncoder({} as FixedSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string>;
    fixEncoder({} as VariableSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string>;
    fixEncoder({} as Encoder<string>, 42) satisfies FixedSizeEncoder<string>;
}

{
    // [fixDecoder]: It transforms any decoder into a fixed size decoder.
    fixDecoder({} as FixedSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string>;
    fixDecoder({} as VariableSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string>;
    fixDecoder({} as Decoder<string>, 42) satisfies FixedSizeDecoder<string>;
}

{
    // [fixCodec]: It transforms any codec into a fixed size codec.
    fixCodec({} as FixedSizeCodec<string>, 42) satisfies FixedSizeCodec<string>;
    fixCodec({} as VariableSizeCodec<string>, 42) satisfies FixedSizeCodec<string>;
    fixCodec({} as Codec<string>, 42) satisfies FixedSizeCodec<string>;
}
