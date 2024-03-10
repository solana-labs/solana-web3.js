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
import { offsetCodec, offsetDecoder, offsetEncoder } from '../offset-codec';

type BrandedEncoder = Encoder<42> & { readonly __brand: unique symbol };
type BrandedDecoder = Decoder<42> & { readonly __brand: unique symbol };
type BrandedCodec = Codec<42> & { readonly __brand: unique symbol };
const config = {};

{
    // [offsetEncoder]: It returns the same encoder type as the one provided.
    offsetEncoder({} as BrandedEncoder, config) satisfies BrandedEncoder;
    offsetEncoder({} as FixedSizeEncoder<string, 42>, config) satisfies FixedSizeEncoder<string, 42>;
    offsetEncoder({} as VariableSizeEncoder<string>, config) satisfies VariableSizeEncoder<string>;
    offsetEncoder({} as Encoder<string>, config) satisfies Encoder<string>;
}

{
    // [offsetDecoder]: It returns the same decoder type as the one provided.
    offsetDecoder({} as BrandedDecoder, config) satisfies BrandedDecoder;
    offsetDecoder({} as FixedSizeDecoder<string, 42>, config) satisfies FixedSizeDecoder<string, 42>;
    offsetDecoder({} as VariableSizeDecoder<string>, config) satisfies VariableSizeDecoder<string>;
    offsetDecoder({} as Decoder<string>, config) satisfies Decoder<string>;
}

{
    // [offsetCodec]: It returns the same codec type as the one provided.
    offsetCodec({} as BrandedCodec, config) satisfies BrandedCodec;
    offsetCodec({} as FixedSizeCodec<string, string, 42>, config) satisfies FixedSizeCodec<string, string, 42>;
    offsetCodec({} as VariableSizeCodec<string>, config) satisfies VariableSizeCodec<string>;
    offsetCodec({} as Codec<string>, config) satisfies Codec<string>;
}
