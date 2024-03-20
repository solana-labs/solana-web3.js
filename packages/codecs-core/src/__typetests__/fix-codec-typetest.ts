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
import { fixCodec, fixDecoder, fixEncoder } from '../fix-codec.js';

{
    // [fixEncoder]: It transforms any encoder into a fixed size encoder.
    fixEncoder({} as FixedSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
    fixEncoder({} as VariableSizeEncoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
    fixEncoder({} as Encoder<string>, 42) satisfies FixedSizeEncoder<string, 42>;
}

{
    // [fixDecoder]: It transforms any decoder into a fixed size decoder.
    fixDecoder({} as FixedSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
    fixDecoder({} as VariableSizeDecoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
    fixDecoder({} as Decoder<string>, 42) satisfies FixedSizeDecoder<string, 42>;
}

{
    // [fixCodec]: It transforms any codec into a fixed size codec.
    fixCodec({} as FixedSizeCodec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
    fixCodec({} as VariableSizeCodec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
    fixCodec({} as Codec<string>, 42) satisfies FixedSizeCodec<string, string, 42>;
}
