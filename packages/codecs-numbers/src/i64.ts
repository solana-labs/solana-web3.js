import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI64Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<number | bigint> =>
    numberEncoderFactory({
        config,
        name: 'i64',
        range: [-BigInt('0x7fffffffffffffff') - 1n, BigInt('0x7fffffffffffffff')],
        set: (view, value, le) => view.setBigInt64(0, BigInt(value), le),
        size: 8,
    });

export const getI64Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<bigint> =>
    numberDecoderFactory({
        config,
        get: (view, le) => view.getBigInt64(0, le),
        name: 'i64',
        size: 8,
    });

export const getI64Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<number | bigint, bigint> =>
    combineCodec(getI64Encoder(config), getI64Decoder(config));
