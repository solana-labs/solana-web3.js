import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { SingleByteNumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI8Encoder = (config: SingleByteNumberCodecConfig = {}): Encoder<number> =>
    numberEncoderFactory({
        config,
        name: 'i8',
        range: [-Number('0x7f') - 1, Number('0x7f')],
        set: (view, value) => view.setInt8(0, value),
        size: 1,
    });

export const getI8Decoder = (config: SingleByteNumberCodecConfig = {}): Decoder<number> =>
    numberDecoderFactory({
        config,
        get: view => view.getInt8(0),
        name: 'i8',
        size: 1,
    });

export const getI8Codec = (config: SingleByteNumberCodecConfig = {}): Codec<number> =>
    combineCodec(getI8Encoder(config), getI8Decoder(config));
