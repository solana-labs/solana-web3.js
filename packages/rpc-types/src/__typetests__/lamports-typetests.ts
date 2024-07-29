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
    getDefaultLamportsCodec,
    getDefaultLamportsDecoder,
    getDefaultLamportsEncoder,
    getLamportsCodec,
    getLamportsDecoder,
    getLamportsEncoder,
    LamportsUnsafeBeyond2Pow53Minus1,
} from '../lamports';

// Default encoder
{
    const encoder = getDefaultLamportsEncoder();
    encoder satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    encoder.fixedSize satisfies 8;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Fixed size inner encoder
{
    const innerEncoder = {} as FixedSizeEncoder<bigint | number, 42>;
    const encoder = getLamportsEncoder(innerEncoder);
    encoder satisfies FixedSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    encoder.fixedSize satisfies 42;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Variable size inner encoder
{
    const innerEncoder = {} as VariableSizeEncoder<bigint | number>;
    const encoder = getLamportsEncoder(innerEncoder);
    encoder satisfies VariableSizeEncoder<LamportsUnsafeBeyond2Pow53Minus1>;
    encoder.getSizeFromValue satisfies (value: bigint | number) => number;
    encoder.maxSize satisfies number | undefined;
    encoder.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
}

// Default decoder
{
    const decoder = getDefaultLamportsDecoder();
    decoder satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 8>;
    decoder.fixedSize satisfies 8;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Fixed size inner decoder
{
    const innerDecoder = {} as FixedSizeDecoder<bigint, 42> | FixedSizeDecoder<number, 42>;
    const decoder = getLamportsDecoder(innerDecoder);
    decoder satisfies FixedSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1, 42>;
    decoder.fixedSize satisfies 42;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Variable size inner decoder
{
    const innerDecoder = {} as VariableSizeDecoder<bigint> | VariableSizeDecoder<number>;
    const decoder = getLamportsDecoder(innerDecoder);
    decoder satisfies VariableSizeDecoder<LamportsUnsafeBeyond2Pow53Minus1>;
    decoder.maxSize satisfies number | undefined;
    decoder.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}

// Default codec
{
    const codec = getDefaultLamportsCodec();
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
    const codec = getLamportsCodec(innerCodec);
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
    const codec = getLamportsCodec(innerCodec);
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1, LamportsUnsafeBeyond2Pow53Minus1>;
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1>;
    codec satisfies VariableSizeCodec<LamportsUnsafeBeyond2Pow53Minus1>;
    codec.maxSize satisfies number | undefined;
    codec.encode(1n as LamportsUnsafeBeyond2Pow53Minus1) satisfies ReadonlyUint8Array;
    codec.decode(null as unknown as ReadonlyUint8Array) satisfies LamportsUnsafeBeyond2Pow53Minus1;
}
