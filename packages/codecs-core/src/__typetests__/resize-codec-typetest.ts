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
import { resizeCodec, resizeDecoder, resizeEncoder } from '../resize-codec';

type NumberToArray<N extends number, T extends unknown[] = []> = T['length'] extends N
    ? T
    : NumberToArray<N, [...T, unknown]>;
type Increment<N extends number> = [...NumberToArray<N>, unknown]['length'];

{
    // [resizeEncoder]: It returns the same encoder type as the one provided for non-fixed size encoders.
    type BrandedEncoder = Encoder<42> & { readonly __brand: unique symbol };
    const resize = (size: number) => size * 2;
    resizeEncoder({} as BrandedEncoder, resize) satisfies BrandedEncoder;
    resizeEncoder({} as VariableSizeEncoder<string>, resize) satisfies VariableSizeEncoder<string>;
    resizeEncoder({} as Encoder<string>, resize) satisfies Encoder<string>;
}

{
    // [resizeEncoder]: It uses the resize ReturnType as size for fixed-size encoders.
    const doubleResize = (size: number): number => size * 2;
    const encoder = {} as FixedSizeEncoder<string, 42>;
    resizeEncoder(encoder, doubleResize) satisfies FixedSizeEncoder<string, number>;
    // @ts-expect-error We no longer know if the fixed size is 42.
    resizeEncoder(encoder, doubleResize) satisfies FixedSizeEncoder<string, 42>;
    const incrementResize = <TSize extends number>(size: TSize) => (size + 1) as Increment<TSize>;
    resizeEncoder(encoder, incrementResize) satisfies FixedSizeEncoder<string, 43>;
}

{
    // [resizeDecoder]: It returns the same decoder type as the one provided for non-fixed size decoders.
    type BrandedDecoder = Decoder<42> & { readonly __brand: unique symbol };
    const resize = (size: number) => size * 2;
    resizeDecoder({} as BrandedDecoder, resize) satisfies BrandedDecoder;
    resizeDecoder({} as VariableSizeDecoder<string>, resize) satisfies VariableSizeDecoder<string>;
    resizeDecoder({} as Decoder<string>, resize) satisfies Decoder<string>;
}

{
    // [resizeDecoder]: It uses the resize ReturnType as size for fixed-size decoders.
    const doubleResize = (size: number): number => size * 2;
    const decoder = {} as FixedSizeDecoder<string, 42>;
    resizeDecoder(decoder, doubleResize) satisfies FixedSizeDecoder<string, number>;
    // @ts-expect-error We no longer know if the fixed size is 42.
    resizeDecoder(decoder, doubleResize) satisfies FixedSizeDecoder<string, 42>;
    const incrementResize = <TSize extends number>(size: TSize) => (size + 1) as Increment<TSize>;
    resizeDecoder(decoder, incrementResize) satisfies FixedSizeDecoder<string, 43>;
}

{
    // [resizeCodec]: It returns the same codec type as the one provided for non-fixed size codecs.
    type BrandedCodec = Codec<42> & { readonly __brand: unique symbol };
    const resize = (size: number) => size * 2;
    resizeCodec({} as BrandedCodec, resize) satisfies BrandedCodec;
    resizeCodec({} as VariableSizeCodec<string>, resize) satisfies VariableSizeCodec<string>;
    resizeCodec({} as Codec<string>, resize) satisfies Codec<string>;
}

{
    // [resizeCodec]: It uses the resize ReturnType as size for fixed-size codecs.
    const doubleResize = (size: number): number => size * 2;
    const codec = {} as FixedSizeCodec<string, string, 42>;
    resizeCodec(codec, doubleResize) satisfies FixedSizeCodec<string, string, number>;
    // @ts-expect-error We no longer know if the fixed size is 42.
    resizeCodec(codec, doubleResize) satisfies FixedSizeCodec<string, 42>;
    const incrementResize = <TSize extends number>(size: TSize) => (size + 1) as Increment<TSize>;
    resizeCodec(codec, incrementResize) satisfies FixedSizeCodec<string, string, 43>;
}
