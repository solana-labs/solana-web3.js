import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU64Encoder = (options: NumberCodecOptions = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        name: 'u64',
        options,
        range: [0, BigInt('0xffffffffffffffff')],
        set: (view, value, le) => view.setBigUint64(0, BigInt(value), le),
        size: 8,
    });

export const getU64Decoder = (options: NumberCodecOptions = {}): Decoder<bigint> =>
    numberDecoderFactory({
        get: (view, le) => view.getBigUint64(0, le),
        name: 'u64',
        options,
        size: 8,
    });

export const getU64Codec = (options: NumberCodecOptions = {}): Codec<number | bigint, bigint> =>
    combineCodec(getU64Encoder(options), getU64Decoder(options));
