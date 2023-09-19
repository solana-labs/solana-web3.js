import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { SingleByteNumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU8Encoder = (options: SingleByteNumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'u8',
        options,
        range: [0, Number('0xff')],
        set: (view, value) => view.setUint8(0, value),
        size: 1,
    });

export const getU8Decoder = (options: SingleByteNumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: view => view.getUint8(0),
        name: 'u8',
        options,
        size: 1,
    });

export const getU8Codec = (options: SingleByteNumberCodecOptions = {}): Codec<number> =>
    combineCodec(getU8Encoder(options), getU8Decoder(options));
