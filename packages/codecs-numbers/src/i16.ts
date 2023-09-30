import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI16Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'i16',
        options,
        range: [-Number('0x7fff') - 1, Number('0x7fff')],
        set: (view, value, le) => view.setInt16(0, value, le),
        size: 2,
    });

export const getI16Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getInt16(0, le),
        name: 'i16',
        options,
        size: 2,
    });

export const getI16Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getI16Encoder(options), getI16Decoder(options));
