import {
    Codec,
    createCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '../codec';

{
    // [createEncoder]: It knows if the encoder is fixed size or variable size.
    createEncoder({
        fixedSize: 42,
        write: (_: string) => 1,
    }) satisfies FixedSizeEncoder<string>;
    createEncoder({
        fixedSize: null,
        getSizeFromValue: (_: string) => 42,
        write: (_: string) => 1,
    }) satisfies VariableSizeEncoder<string>;
    createEncoder({} as Encoder<string>) satisfies Encoder<string>;
}

{
    // [createDecoder]: It knows if the decoder is fixed size or variable size.
    createDecoder({
        fixedSize: 42,
        read: (): [string, number] => ['', 1],
    }) satisfies FixedSizeDecoder<string>;
    createDecoder({
        fixedSize: null,
        read: (): [string, number] => ['', 1],
    }) satisfies VariableSizeDecoder<string>;
    createDecoder({} as Decoder<string>) satisfies Decoder<string>;
}

{
    // [createCodec]: It knows if the codec is fixed size or variable size.
    createCodec({
        fixedSize: 42,
        read: (): [string, number] => ['', 1],
        write: (_: string) => 1,
    }) satisfies FixedSizeCodec<string>;
    createCodec({
        fixedSize: null,
        read: (): [string, number] => ['', 1],
        getSizeFromValue: (_: string) => 42,
        write: (_: string) => 1,
    }) satisfies VariableSizeCodec<string>;
    createCodec({} as Codec<string>) satisfies Codec<string>;
}
