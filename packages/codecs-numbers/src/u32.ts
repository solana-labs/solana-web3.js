import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU32Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number> =>
    numberEncoderFactory({
        config,
        name: 'u32',
        range: [0, Number('0xffffffff')],
        set: (view, value, le) => view.setUint32(0, value, le),
        size: 4,
    });

export const getU32Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<number> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getUint32(0, le),
        name: 'u32',
        size: 4,
    });

export const getU32Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number> =>
    combineCodec(getU32Encoder(config), getU32Decoder(config));
