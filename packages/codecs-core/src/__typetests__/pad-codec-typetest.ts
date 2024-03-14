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
import {
    padLeftCodec,
    padLeftDecoder,
    padLeftEncoder,
    padRightCodec,
    padRightDecoder,
    padRightEncoder,
} from '../pad-codec';

type BrandedEncoder = Encoder<42> & { readonly __brand: unique symbol };
type BrandedDecoder = Decoder<42> & { readonly __brand: unique symbol };
type BrandedCodec = Codec<42> & { readonly __brand: unique symbol };

{
    // [padLeftEncoder]: It returns the same encoder type as the one provided.
    padLeftEncoder({} as BrandedEncoder, 8) satisfies BrandedEncoder;
    padLeftEncoder({} as FixedSizeEncoder<string, 42>, 8) satisfies FixedSizeEncoder<string, 42>;
    padLeftEncoder({} as VariableSizeEncoder<string>, 8) satisfies VariableSizeEncoder<string>;
    padLeftEncoder({} as Encoder<string>, 8) satisfies Encoder<string>;
}

{
    // [padLeftDecoder]: It returns the same decoder type as the one provided.
    padLeftDecoder({} as BrandedDecoder, 8) satisfies BrandedDecoder;
    padLeftDecoder({} as FixedSizeDecoder<string, 42>, 8) satisfies FixedSizeDecoder<string, 42>;
    padLeftDecoder({} as VariableSizeDecoder<string>, 8) satisfies VariableSizeDecoder<string>;
    padLeftDecoder({} as Decoder<string>, 8) satisfies Decoder<string>;
}

{
    // [padLeftCodec]: It returns the same codec type as the one provided.
    padLeftCodec({} as BrandedCodec, 8) satisfies BrandedCodec;
    padLeftCodec({} as FixedSizeCodec<string, string, 42>, 8) satisfies FixedSizeCodec<string, string, 42>;
    padLeftCodec({} as VariableSizeCodec<string>, 8) satisfies VariableSizeCodec<string>;
    padLeftCodec({} as Codec<string>, 8) satisfies Codec<string>;
}

{
    // [padRightEncoder]: It returns the same encoder type as the one provided.
    padRightEncoder({} as BrandedEncoder, 8) satisfies BrandedEncoder;
    padRightEncoder({} as FixedSizeEncoder<string, 42>, 8) satisfies FixedSizeEncoder<string, 42>;
    padRightEncoder({} as VariableSizeEncoder<string>, 8) satisfies VariableSizeEncoder<string>;
    padRightEncoder({} as Encoder<string>, 8) satisfies Encoder<string>;
}

{
    // [padRightDecoder]: It returns the same decoder type as the one provided.
    padRightDecoder({} as BrandedDecoder, 8) satisfies BrandedDecoder;
    padRightDecoder({} as FixedSizeDecoder<string, 42>, 8) satisfies FixedSizeDecoder<string, 42>;
    padRightDecoder({} as VariableSizeDecoder<string>, 8) satisfies VariableSizeDecoder<string>;
    padRightDecoder({} as Decoder<string>, 8) satisfies Decoder<string>;
}

{
    // [padRightCodec]: It returns the same codec type as the one provided.
    padRightCodec({} as BrandedCodec, 8) satisfies BrandedCodec;
    padRightCodec({} as FixedSizeCodec<string, string, 42>, 8) satisfies FixedSizeCodec<string, string, 42>;
    padRightCodec({} as VariableSizeCodec<string>, 8) satisfies VariableSizeCodec<string>;
    padRightCodec({} as Codec<string>, 8) satisfies Codec<string>;
}
