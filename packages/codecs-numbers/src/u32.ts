import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU32Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'u32',
        options,
        range: [0, Number('0xffffffff')],
        set: (view, value, le) => view.setUint32(0, value, le),
        size: 4,
    });

export const getU32Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getUint32(0, le),
        name: 'u32',
        options,
        size: 4,
    });

export const getU32Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getU32Encoder(options), getU32Decoder(options));
