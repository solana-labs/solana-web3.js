import { Codec, Decoder, Encoder } from '@solana/codecs-core';
import { getStructCodec, getStructDecoder, getStructEncoder } from '@solana/codecs-data-structures';
import { getU8Codec, getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';

import { getCompiledMessageHeader } from '../compile-header';

type MessageHeader = ReturnType<typeof getCompiledMessageHeader>;

let memoizedU8Encoder: Encoder<number> | undefined;
function getMemoizedU8Encoder(): Encoder<number> {
    if (!memoizedU8Encoder) memoizedU8Encoder = getU8Encoder();
    return memoizedU8Encoder;
}

function getMemoizedU8EncoderDescription(description?: string): Encoder<number> {
    const encoder = getMemoizedU8Encoder();
    return {
        ...encoder,
        description: description ?? encoder.description,
    };
}

let memoizedU8Decoder: Decoder<number> | undefined;
function getMemoizedU8Decoder(): Decoder<number> {
    if (!memoizedU8Decoder) memoizedU8Decoder = getU8Decoder();
    return memoizedU8Decoder;
}

function getMemoizedU8DecoderDescription(description?: string): Decoder<number> {
    const decoder = getMemoizedU8Decoder();
    return {
        ...decoder,
        description: description ?? decoder.description,
    };
}

let memoizedU8Codec: Codec<number> | undefined;
function getMemoizedU8Codec(): Codec<number> {
    if (!memoizedU8Codec) memoizedU8Codec = getU8Codec();
    return memoizedU8Codec;
}

function getMemoizedU8CodecDescription(description?: string): Codec<number> {
    const codec = getMemoizedU8Codec();
    return {
        ...codec,
        description: description ?? codec.description,
    };
}

const numSignerAccountsDescription = __DEV__
    ? 'The expected number of addresses in the static address list belonging to accounts that are required to sign this transaction'
    : undefined;

const numReadonlySignerAccountsDescription = __DEV__
    ? 'The expected number of addresses in the static address list belonging to accounts that are required to sign this transaction, but may not be writable'
    : undefined;

const numReadonlyNonSignerAccountsDescription = __DEV__
    ? 'The expected number of addresses in the static address list belonging to accounts that are neither signers, nor writable'
    : undefined;

const messageHeaderDescription = __DEV__
    ? 'The transaction message header containing counts of the signer, readonly-signer, and readonly-nonsigner account addresses'
    : undefined;

export function getMessageHeaderEncoder(): Encoder<MessageHeader> {
    return getStructEncoder(
        [
            ['numSignerAccounts', getMemoizedU8EncoderDescription(numSignerAccountsDescription)],
            ['numReadonlySignerAccounts', getMemoizedU8EncoderDescription(numReadonlySignerAccountsDescription)],
            ['numReadonlyNonSignerAccounts', getMemoizedU8EncoderDescription(numReadonlyNonSignerAccountsDescription)],
        ],
        {
            description: messageHeaderDescription,
        }
    );
}

export function getMessageHeaderDecoder(): Decoder<MessageHeader> {
    return getStructDecoder(
        [
            ['numSignerAccounts', getMemoizedU8DecoderDescription(numSignerAccountsDescription)],
            ['numReadonlySignerAccounts', getMemoizedU8DecoderDescription(numReadonlySignerAccountsDescription)],
            ['numReadonlyNonSignerAccounts', getMemoizedU8DecoderDescription(numReadonlyNonSignerAccountsDescription)],
        ],
        {
            description: messageHeaderDescription,
        }
    );
}

export function getMessageHeaderCodec(): Codec<MessageHeader> {
    return getStructCodec(
        [
            ['numSignerAccounts', getMemoizedU8CodecDescription(numSignerAccountsDescription)],
            ['numReadonlySignerAccounts', getMemoizedU8CodecDescription(numReadonlySignerAccountsDescription)],
            ['numReadonlyNonSignerAccounts', getMemoizedU8CodecDescription(numReadonlyNonSignerAccountsDescription)],
        ],
        {
            description: messageHeaderDescription,
        }
    );
}
