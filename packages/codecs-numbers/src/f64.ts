import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getF64Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number> =>
    numberEncoderFactory({
        config,
        name: 'f64',
        set: (view, value, le) => view.setFloat64(0, value, le),
        size: 8,
    });

export const getF64Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getFloat64(0, le),
        name: 'f64',
        size: 8,
    });

export const getF64Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number> =>
    combineCodec(getF64Encoder(config), getF64Decoder(config));
