import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI64Encoder = (options: NumberCodecOptions = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        name: 'i64',
        options,
        range: [-BigInt('0x7fffffffffffffff') - 1n, BigInt('0x7fffffffffffffff')],
        set: (view, value, le) => view.setBigInt64(0, BigInt(value), le),
        size: 8,
    });

export const getI64Decoder = (options: NumberCodecOptions = {}): Decoder<bigint> =>
    numberDecoderFactory({
        get: (view, le) => view.getBigInt64(0, le),
        name: 'i64',
        options,
        size: 8,
    });

export const getI64Codec = (options: NumberCodecOptions = {}): Codec<number | bigint, bigint> =>
    combineCodec(getI64Encoder(options), getI64Decoder(options));
