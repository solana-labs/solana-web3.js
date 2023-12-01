import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU16Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number> =>
    numberEncoderFactory({
        config,
        name: 'u16',
        range: [0, Number('0xffff')],
        set: (view, value, le) => view.setUint16(0, value, le),
        size: 2,
    });

export const getU16Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getUint16(0, le),
        name: 'u16',
        size: 2,
    });

export const getU16Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number> =>
    combineCodec(getU16Encoder(config), getU16Decoder(config));
