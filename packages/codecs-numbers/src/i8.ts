import { combineCodec, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

import { numberDecoderFactory, numberEncoderFactory } from './utils';

export const getI8Encoder = (): FixedSizeEncoder<bigint | number, 1> =>
    numberEncoderFactory({
        name: 'i8',
        range: [-Number('0x7f') - 1, Number('0x7f')],
        set: (view, value) => view.setInt8(0, Number(value)),
        size: 1,
    });

export const getI8Decoder = (): FixedSizeDecoder<number, 1> =>
    numberDecoderFactory({
        get: view => view.getInt8(0),
        name: 'i8',
        size: 1,
    });

export const getI8Codec = (): FixedSizeCodec<bigint | number, number, 1> =>
    combineCodec(getI8Encoder(), getI8Decoder());
