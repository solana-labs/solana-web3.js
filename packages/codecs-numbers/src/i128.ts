import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { NumberCodecConfig } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI128Encoder = (config: NumberCodecConfig = {}): FixedSizeEncoder<bigint | number, 16> =>
    numberEncoderFactory({
        config,
        name: 'i128',
        range: [-BigInt('0x7fffffffffffffffffffffffffffffff') - 1n, BigInt('0x7fffffffffffffffffffffffffffffff')],
        set: (view, value, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigInt64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16,
    });

export const getI128Decoder = (config: NumberCodecConfig = {}): FixedSizeDecoder<bigint, 16> =>
    numberDecoderFactory({
        config,
        get: (view, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigInt64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: 'i128',
        size: 16,
    });

export const getI128Codec = (config: NumberCodecConfig = {}): FixedSizeCodec<bigint | number, bigint, 16> =>
    combineCodec(getI128Encoder(config), getI128Decoder(config));
