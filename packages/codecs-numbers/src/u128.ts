import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU128Encoder = (config: NumberCodecConfig = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        config,
        name: 'u128',
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

export const getU128Decoder = (config: NumberCodecConfig = {}): Decoder<bigint> =>
    numberDecoderFactory({
        config,
        get: (view, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigUint64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: 'u128',
        size: 16,
    });

export const getU128Codec = (config: NumberCodecConfig = {}): Codec<number | bigint, bigint> =>
    combineCodec(getU128Encoder(config), getU128Decoder(config));
