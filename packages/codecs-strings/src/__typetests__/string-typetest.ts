import {
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { getStringCodec, getStringDecoder, getStringEncoder } from '../string.js';

{
    // [getStringEncoder]: It knows if the encoder is fixed size or variable size.
    getStringEncoder() satisfies VariableSizeEncoder<string>;
    getStringEncoder({ size: 42 }) satisfies FixedSizeEncoder<string, 42>;
    getStringEncoder({ size: 'variable' }) satisfies VariableSizeEncoder<string>;
    getStringEncoder({
        encoding: {} as VariableSizeEncoder<string>,
        size: 'variable',
    }) satisfies VariableSizeEncoder<string>;
    getStringEncoder({
        encoding: {} as FixedSizeEncoder<string, 42>,
        size: 'variable',
    }) satisfies FixedSizeEncoder<string, 42>;
}

{
    // [getStringDecoder]: It knows if the decoder is fixed size or variable size.
    getStringDecoder() satisfies VariableSizeDecoder<string>;
    getStringDecoder({ size: 42 }) satisfies FixedSizeDecoder<string, 42>;
    getStringDecoder({ size: 'variable' }) satisfies VariableSizeDecoder<string>;
    getStringDecoder({
        encoding: {} as VariableSizeDecoder<string>,
        size: 'variable',
    }) satisfies VariableSizeDecoder<string>;
    getStringDecoder({
        encoding: {} as FixedSizeDecoder<string, 42>,
        size: 'variable',
    }) satisfies FixedSizeDecoder<string, 42>;
}

{
    // [getStringCodec]: It knows if the codec is fixed size or variable size.
    getStringCodec() satisfies VariableSizeCodec<string>;
    getStringCodec({ size: 42 }) satisfies FixedSizeCodec<string, string, 42>;
    getStringCodec({ size: 'variable' }) satisfies VariableSizeCodec<string>;
    getStringCodec({
        encoding: {} as VariableSizeCodec<string>,
        size: 'variable',
    }) satisfies VariableSizeCodec<string>;
    getStringCodec({
        encoding: {} as FixedSizeCodec<string, string, 42>,
        size: 'variable',
    }) satisfies FixedSizeCodec<string, string, 42>;
}
