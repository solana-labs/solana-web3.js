import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getF32Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'f32',
        options,
        set: (view, value, le) => view.setFloat32(0, value, le),
        size: 4,
    });

export const getF32Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getFloat32(0, le),
        name: 'f32',
        options,
        size: 4,
    });

export const getF32Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getF32Encoder(options), getF32Decoder(options));
