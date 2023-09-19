import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI32Encoder = (options: NumberCodecOptions = {}): Encoder<number> =>
    numberEncoderFactory({
        name: 'i32',
        options,
        range: [-Number('0x7fffffff') - 1, Number('0x7fffffff')],
        set: (view, value, le) => view.setInt32(0, value, le),
        size: 4,
    });

export const getI32Decoder = (options: NumberCodecOptions = {}): Decoder<number> =>
    numberDecoderFactory({
        get: (view, le) => view.getInt32(0, le),
        name: 'i32',
        options,
        size: 4,
    });

export const getI32Codec = (options: NumberCodecOptions = {}): Codec<number> =>
    combineCodec(getI32Encoder(options), getI32Decoder(options));
