import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    ReadonlyUint8Array,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import {
    getLamportsCodec,
    getLamportsCodecFromCodec,
    getLamportsDecoder,
    getLamportsDecoderFromDecoder,
    getLamportsEncoder,
    getLamportsEncoderFromEncoder,
    LamportsUnsafeBeyond2Pow53Minus1,
} from '../lamports';

// Default encoder
{
    const encoder = getLamportsEncoder();
    encoder satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    encoder.fixedSize satisfies 8;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Fixed size inner encoder
{
    const innerEncoder = {} as FixedSizeEncoder<bigint | number, 42>;
    const encoder = getLamportsEncoderFromEncoder(innerEncoder);
    encoder satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    encoder.fixedSize satisfies 42;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Variable size inner encoder
{
    const innerEncoder = {} as VariableSizeEncoder<bigint | number>;
    const encoder = getLamportsEncoderFromEncoder(innerEncoder);
    encoder satisfies VariableSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1>;
    encoder.getSizeFromValue satisfies (value: bigint | number) => number;
    encoder.maxSize satisfies number | undefined;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Default decoder
{
    const decoder = getLamportsDecoder();
    decoder satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    decoder.fixedSize satisfies 8;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Fixed size inner decoder
{
    const innerDecoder = {} as FixedSizeDecoder<bigint, 42> | FixedSizeDecoder<number, 42>;
    const decoder = getLamportsDecoderFromDecoder(innerDecoder);
    decoder satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    decoder.fixedSize satisfies 42;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Variable size inner decoder
{
    const innerDecoder = {} as VariableSizeDecoder<bigint> | VariableSizeDecoder<number>;
    const decoder = getLamportsDecoderFromDecoder(innerDecoder);
    decoder satisfies VariableSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1>;
    decoder.maxSize satisfies number | undefined;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Default codec
{
    const codec = getLamportsCodec();
    codec satisfies FixedSizeCodec<LamportsUnsafeBeyond2Pow53Minus1, LamportsUnsafeBeyond2Pow53Minus1, 8>;
    codec satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    codec satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    codec.fixedSize satisfies 8;
    codec.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
    codec.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Fixed size inner codec
{
    const innerCodec = {} as FixedSizeCodec<bigint | number, bigint, 42> | FixedSizeCodec<bigint | number, number, 42>;
    const codec = getLamportsCodecFromCodec(innerCodec);
    codec satisfies FixedSizeCodec<LamportsUnsafeBeyond2Pow53Minus1, LamportsUnsafeBeyond2Pow53Minus1, 42>;
    codec satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    codec satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    codec.fixedSize satisfies 42;
    codec.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
    codec.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Variable size codec
{
    const innerCodec = {} as VariableSizeCodec<bigint | number, bigint> | VariableSizeCodec<bigint | number, number>;
    const codec = getLamportsCodecFromCodec(innerCodec);
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1, LamportsUnsafeBeyond2Pow53Minus1>;
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1>;
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1>;
    codec.maxSize satisfies number | undefined;
    codec.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
    codec.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}
