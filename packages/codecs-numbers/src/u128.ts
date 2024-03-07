import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getU128Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<bigint | number, 16> =>
    numberEncoderFactory({
        config,
        name: 'u128',
        range: [0n, BigInt('0xffffffffffffffffffffffffffffffff')],
        set: (view, value, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigUint64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16,
    });

export const getU128Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<bigint, 16> =>
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

export const getU128Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<bigint | number, bigint, 16> =>
    combineCodec(getU128Encoder(config), getU128Decoder(config));
