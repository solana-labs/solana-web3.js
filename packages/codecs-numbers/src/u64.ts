import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU64Encoder = (config: NumberCodecConfig = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        config,
        name: 'u64',
        range: [0, BigInt('0xffffffffffffffff')],
        set: (view, value, le) => view.setBigUint64(0, BigInt(value), le),
        size: 8,
    });

export const getU64Decoder = (config: NumberCodecConfig = {}): Decoder<bigint> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getBigUint64(0, le),
        name: 'u64',
        size: 8,
    });

export const getU64Codec = (config: NumberCodecConfig = {}): Codec<number | bigint, bigint> =>
    combineCodec(getU64Encoder(config), getU64Decoder(config));
