import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU64Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<bigint | number, 8> =>
    numberEncoderFactory({
        config,
        name: 'u64',
        range: [0n, BigInt('0xffffffffffffffff')],
        set: (view, value, le) => view.setBigUint64(0, BigInt(value), le),
        size: 8,
    });

export const getU64Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<bigint, 8> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getBigUint64(0, le),
        name: 'u64',
        size: 8,
    });

export const getU64Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<bigint | number, bigint, 8> =>
    combineCodec(getU64Encoder(config), getU64Decoder(config));
