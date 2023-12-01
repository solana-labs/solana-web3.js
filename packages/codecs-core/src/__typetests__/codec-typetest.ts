import {
    assertIsFixedSizeCodec,
    assertIsVariableSizeCodec,
    Codec,
    createCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSizeCodec,
    isVariableSizeCodec,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '../codec';

{
    // [createEncoder]: It knows if the encoder is fixed size or variable size.
    createEncoder({
        fixedSize: 42,
        write: (_: string) => 1,
    }) satisfies FixedSizeEncoder<string, 42>;
    createEncoder({
        getSizeFromValue: (_: string) => 42,
        write: (_: string) => 1,
    }) satisfies VariableSizeEncoder<string>;
    createEncoder({} as Encoder<string>) satisfies Encoder<string>;
}

{
    // [createDecoder]: It knows if the decoder is fixed size or variable size.
    createDecoder({ fixedSize: 42, read: (): [string, number] => ['', 1] }) satisfies FixedSizeDecoder<string, 42>;
    createDecoder({ read: (): [string, number] => ['', 1] }) satisfies VariableSizeDecoder<string>;
    createDecoder({} as Decoder<string>) satisfies Decoder<string>;
}

{
    // [createCodec]: It knows if the codec is fixed size or variable size.
    createCodec({
        fixedSize: 42,
        read: (): [string, number] => ['', 1],
        write: (_: string) => 1,
    }) satisfies FixedSizeCodec<string, string, 42>;
    createCodec({
        getSizeFromValue: (_: string) => 42,
        read: (): [string, number] => ['', 1],
        write: (_: string) => 1,
    }) satisfies VariableSizeCodec<string>;
    createCodec({} as Codec<string>) satisfies Codec<string>;
}

{
    // [isFixedSizeCodec]: It returns true if the codec is fixed size and keeps the type information.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    if (isFixedSizeCodec(codec)) {
        codec satisfies FixedSizeCodec<string, string, 42>;
    }
}

{
    // [isFixedSizeCodec]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number };
    if (isFixedSizeCodec(codec)) {
        codec satisfies { fixedSize: 42 };
    }
}

{
    // [assertIsFixedSizeCodec]: It asserts the codec is fixed size and keeps the type information.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    assertIsFixedSizeCodec(codec);
    codec satisfies FixedSizeCodec<string, string, 42>;
}

{
    // [assertIsFixedSizeCodec]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number };
    assertIsFixedSizeCodec(codec);
    codec satisfies { fixedSize: 42 };
}

{
    // [isVariableSizeCodec]: It returns true if the codec is variable size.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    if (isVariableSizeCodec(codec)) {
        codec satisfies VariableSizeCodec<string>;
    }
}

{
    // [isVariableSizeCodec]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number; foo: 'bar' };
    if (isVariableSizeCodec(codec)) {
        codec satisfies { maxSize?: number; foo: 'bar' };
    }
}

{
    // [assertIsVariableSizeCodec]: It asserts the codec is variable size.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    assertIsVariableSizeCodec(codec);
    codec satisfies VariableSizeCodec<string>;
}

{
    // [assertIsVariableSizeCodec]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number; foo: 'bar' };
    assertIsVariableSizeCodec(codec);
    codec satisfies { maxSize?: number; foo: 'bar' };
}
