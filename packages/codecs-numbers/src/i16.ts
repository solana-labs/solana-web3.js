import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI16Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number, 2> =>
    numberEncoderFactory({
        config,
        name: 'i16',
        range: [-Number('0x7fff') - 1, Number('0x7fff')],
        set: (view, value, le) => view.setInt16(0, value, le),
        size: 2,
    });

export const getI16Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number, 2> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getInt16(0, le),
        name: 'i16',
        size: 2,
    });

export const getI16Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number, number, 2> =>
    combineCodec(getI16Encoder(config), getI16Decoder(config));
