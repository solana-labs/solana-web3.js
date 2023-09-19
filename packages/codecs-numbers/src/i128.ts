import { Codec, combineCodec, Decoder, Encoder } from '@solana/codecs-core';

import { NumberCodecOptions } from './common';
import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI128Encoder = (options: NumberCodecOptions = {}): Encoder<number | bigint> =>
    numberEncoderFactory({
        name: 'i128',
        options,
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

export const getI128Decoder = (options: NumberCodecOptions = {}): Decoder<bigint> =>
    numberDecoderFactory({
        get: (view, le) => {
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigInt64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: 'i128',
        options,
        size: 16,
    });

export const getI128Codec = (options: NumberCodecOptions = {}): Codec<number | bigint, bigint> =>
    combineCodec(getI128Encoder(options), getI128Decoder(options));
