import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getF32Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number, 4> =>
    numberEncoderFactory({
        config,
        name: 'f32',
        set: (view, value, le) => view.setFloat32(0, value, le),
        size: 4,
    });

export const getF32Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number, 4> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getFloat32(0, le),
        name: 'f32',
        size: 4,
    });

export const getF32Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number, number, 4> =>
    combineCodec(getF32Encoder(config), getF32Decoder(config));
