import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getF64Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'f64',
        options,
        set: (view, value, le) => view.setFloat64(0, value, le),
        size: 8,
    });

export const getF64Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getFloat64(0, le),
        name: 'f64',
        options,
        size: 8,
    });

export const getF64Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getF64Encoder(options), getF64Decoder(options));
