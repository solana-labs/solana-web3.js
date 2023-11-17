import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { SingleByteNumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU8Encoder = (config: SingleByteNumberCodecConfig = {}): Encoder<number> =>
    numberEncoderFactory({
        config,
        name: 'u8',
        range: [0, Number('0xff')],
        set: (view, value) => view.setUint8(0, value),
        size: 1,
    });

export const getU8Decoder = (config: SingleByteNumberCodecConfig = {}): Decoder<number> =>
    numberDecoderFactory({
        config,
        get: view => view.getUint8(0),
        name: 'u8',
        size: 1,
    });

export const getU8Codec = (config: SingleByteNumberCodecConfig = {}): Codec<number> =>
    combineCodec(getU8Encoder(config), getU8Decoder(config));
