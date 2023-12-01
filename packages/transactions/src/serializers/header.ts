import { FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';
import { getStructCodec, getStructDecoder, getStructEncoder } from '@solana/codecs-data-structures';
import { getU8Codec, getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';

import { getCompiledMessageHeader } from '../compile-header';

type MessageHeader = ReturnType<typeof getCompiledMessageHeader>;

let memoizedU8Encoder: FixedSizeEncoder<number, 1> | undefined;
function getMemoizedU8Encoder(): FixedSizeEncoder<number, 1> {
    if (!memoizedU8Encoder) memoizedU8Encoder = getU8Encoder();
    return memoizedU8Encoder;
}

let memoizedU8Decoder: FixedSizeDecoder<number, 1> | undefined;
function getMemoizedU8Decoder(): FixedSizeDecoder<number, 1> {
    if (!memoizedU8Decoder) memoizedU8Decoder = getU8Decoder();
    return memoizedU8Decoder;
}

let memoizedU8Codec: FixedSizeCodec<number, number, 1> | undefined;
function getMemoizedU8Codec(): FixedSizeCodec<number, number, 1> {
    if (!memoizedU8Codec) memoizedU8Codec = getU8Codec();
    return memoizedU8Codec;
}

export function getMessageHeaderEncoder(): FixedSizeEncoder<MessageHeader, 3> {
    return getStructEncoder([
        ['numSignerAccounts', getMemoizedU8Encoder()],
        ['numReadonlySignerAccounts', getMemoizedU8Encoder()],
        ['numReadonlyNonSignerAccounts', getMemoizedU8Encoder()],
    ]) as FixedSizeEncoder<MessageHeader, 3>;
}

export function getMessageHeaderDecoder(): FixedSizeDecoder<MessageHeader, 3> {
    return getStructDecoder([
        ['numSignerAccounts', getMemoizedU8Decoder()],
        ['numReadonlySignerAccounts', getMemoizedU8Decoder()],
        ['numReadonlyNonSignerAccounts', getMemoizedU8Decoder()],
    ]) as FixedSizeDecoder<MessageHeader, 3>;
}

export function getMessageHeaderCodec(): FixedSizeCodec<MessageHeader, MessageHeader, 3> {
    return getStructCodec([
        ['numSignerAccounts', getMemoizedU8Codec()],
        ['numReadonlySignerAccounts', getMemoizedU8Codec()],
        ['numReadonlyNonSignerAccounts', getMemoizedU8Codec()],
    ]) as FixedSizeCodec<MessageHeader, MessageHeader, 3>;
}
