import {
    assertIsFixedSize,
    assertIsVariableSize,
    Codec,
    createCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSize,
    isVariableSize,
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
    // [isFixedSize]: It returns true if the codec is fixed size and keeps the type information.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    if (isFixedSize(codec)) {
        codec satisfies FixedSizeCodec<string, string, 42>;
    }
}

{
    // [isFixedSize]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number };
    if (isFixedSize(codec)) {
        codec satisfies { fixedSize: 42 };
    }
}

{
    // [assertIsFixedSize]: It asserts the codec is fixed size and keeps the type information.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    assertIsFixedSize(codec);
    codec satisfies FixedSizeCodec<string, string, 42>;
}

{
    // [assertIsFixedSize]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { maxSize?: number };
    assertIsFixedSize(codec);
    codec satisfies { fixedSize: 42 };
}

{
    // [isVariableSize]: It returns true if the codec is variable size.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    if (isVariableSize(codec)) {
        codec satisfies VariableSizeCodec<string>;
    }
}

{
    // [isVariableSize]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { foo: 'bar'; maxSize?: number };
    if (isVariableSize(codec)) {
        codec satisfies { foo: 'bar'; maxSize?: number };
    }
}

{
    // [assertIsVariableSize]: It asserts the codec is variable size.
    const codec = {} as FixedSizeCodec<string, string, 42> | VariableSizeCodec<string>;
    assertIsVariableSize(codec);
    codec satisfies VariableSizeCodec<string>;
}

{
    // [assertIsVariableSize]: It works with codec sizes only.
    const codec = {} as { fixedSize: 42 } | { foo: 'bar'; maxSize?: number };
    assertIsVariableSize(codec);
    codec satisfies { foo: 'bar'; maxSize?: number };
}
