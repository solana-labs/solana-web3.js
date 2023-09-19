import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { SingleByteNumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI8Encoder = (options: SingleByteNumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'i8',
        options,
        range: [-Number('0x7f') - 1, Number('0x7f')],
        set: (view, value) => view.setInt8(0, value),
        size: 1,
    });

export const getI8Decoder = (options: SingleByteNumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: view => view.getInt8(0),
        name: 'i8',
        options,
        size: 1,
    });

export const getI8Codec = (options: SingleByteNumberCodecOptions = {}): Codec<number> =>
    combineCodec(getI8Encoder(options), getI8Decoder(options));
