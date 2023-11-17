import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI16Encoder = (config: NumberCodecConfig = {}): Encoder<number> =>
    numberEncoderFactory({
        config,
        name: 'i16',
        range: [-Number('0x7fff') - 1, Number('0x7fff')],
        set: (view, value, le) => view.setInt16(0, value, le),
        size: 2,
    });

export const getI16Decoder = (config: NumberCodecConfig = {}): Decoder<number> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getInt16(0, le),
        name: 'i16',
        size: 2,
    });

export const getI16Codec = (config: NumberCodecConfig = {}): Codec<number> =>
    combineCodec(getI16Encoder(config), getI16Decoder(config));
