import type { VariableSizeDecoder, VariableSizeEncoder } from '@solana/codecs-core';
import { getBase64Decoder, getUtf8Encoder } from '@solana/codecs-strings';

import { cacheKeyFn } from './cache-key';

let memoizedUtf8Encoder: VariableSizeEncoder<string>;
let memoizedBase64Decoder: VariableSizeDecoder<string>;

function getMemoizedIdentifierEncoderDecoder(): [VariableSizeEncoder<string>, VariableSizeDecoder<string>] {
    if (!memoizedUtf8Encoder || !memoizedBase64Decoder) {
        memoizedUtf8Encoder = getUtf8Encoder();
        memoizedBase64Decoder = getBase64Decoder();
    }
    return [memoizedUtf8Encoder, memoizedBase64Decoder];
}

export type ID<TID extends string = string> = TID & {
    readonly __brand: unique symbol;
};

export const identifierFn = (obj: unknown) => {
    const [{ encode }, { decode }] = getMemoizedIdentifierEncoderDecoder();
    return decode(encode(cacheKeyFn(obj))) as ID;
};
