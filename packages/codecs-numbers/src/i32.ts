import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI32Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number, 4> =>
    numberEncoderFactory({
        config,
        name: 'i32',
        range: [-Number('0x7fffffff') - 1, Number('0x7fffffff')],
        set: (view, value, le) => view.setInt32(0, value, le),
        size: 4,
    });

export const getI32Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number, 4> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getInt32(0, le),
        name: 'i32',
        size: 4,
    });

export const getI32Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number, number, 4> =>
    combineCodec(getI32Encoder(config), getI32Decoder(config));
