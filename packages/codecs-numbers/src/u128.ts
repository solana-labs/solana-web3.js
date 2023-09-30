import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU128Encoder = (options: NumberCodecOptions = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        name: 'u128',
        options,
        range: [0, BigInt('0xffffffffffffffffffffffffffffffff')],
        set: (view, value, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigUint64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16,
    });

export const getU128Decoder = (options: NumberCodecOptions = {}): Decoder<bigint> =>
    numberDecoderFactory({
        get: (view, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigUint64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: 'u128',
        options,
        size: 16,
    });

export const getU128Codec = (options: NumberCodecOptions = {}): Codec<number | bigint, bigint> =>
    combineCodec(getU128Encoder(options), getU128Decoder(options));
