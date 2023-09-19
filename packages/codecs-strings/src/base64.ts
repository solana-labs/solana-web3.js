import { combineCodec, mapDecoder, mapEncoder } from '@solana/codecs-core';

import { getBaseXResliceDecoder, getBaseXResliceEncoder } from './baseX-reslice';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Encodes strings in base64. */
export const getBase64Encoder = () =>
    mapEncoder(getBaseXResliceEncoder(alphabet, 6), (value: string): string => value.replace(/=/g, ''));

/** Decodes strings in base64. */
export const getBase64Decoder = () =>
    mapDecoder(getBaseXResliceDecoder(alphabet, 6), (value: string): string =>
        value.padEnd(Math.ceil(value.length / 4) * 4, '=')
    );

/** Encodes and decodes strings in base64. */
export const getBase64Codec = () => combineCodec(getBase64Encoder(), getBase64Decoder());
