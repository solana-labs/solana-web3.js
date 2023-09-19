import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU16Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'u16',
        options,
        range: [0, Number('0xffff')],
        set: (view, value, le) => view.setUint16(0, value, le),
        size: 2,
    });

export const getU16Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getUint16(0, le),
        name: 'u16',
        options,
        size: 2,
    });

export const getU16Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getU16Encoder(options), getU16Decoder(options));
