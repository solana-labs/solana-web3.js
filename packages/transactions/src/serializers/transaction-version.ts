import { Serializer } from '@metaplex-foundation/umi-serializers';

import { TransactionVersion } from '../types';
import { getUnimplementedDecoder, getUnimplementedEncoder } from './unimplemented';

const VERSION_FLAG_MASK = 0x80;

const BASE_CONFIG = {
    description: __DEV__ ? 'A single byte that encodes the version of the transaction' : '',
    fixedSize: null,
    maxSize: 1,
} as const;

function deserialize(bytes: Uint8Array, offset = 0): [TransactionVersion, number] {
    const firstByte = bytes[offset];
    if ((firstByte & VERSION_FLAG_MASK) === 0) {
        // No version flag set; it's a legacy (unversioned) transaction.
        return ['legacy', offset];
    } else {
        const version = (firstByte ^ VERSION_FLAG_MASK) as TransactionVersion;
        return [version, offset + 1];
    }
}

function serialize(value: TransactionVersion): Uint8Array {
    if (value === 'legacy') {
        return new Uint8Array();
    }
    if (value < 0 || value > 127) {
        // TODO: Coded error.
        throw new Error(`Transaction version must be in the range [0, 127]. \`${value}\` given.`);
    }
    return new Uint8Array([value | VERSION_FLAG_MASK]);
}

export function getTransactionVersionDecoder(): Serializer<TransactionVersion> {
    return {
        ...BASE_CONFIG,
        deserialize,
        serialize: getUnimplementedEncoder('TransactionVersion'),
    };
}

export function getTransactionVersionEncoder(): Serializer<TransactionVersion> {
    return {
        ...BASE_CONFIG,
        deserialize: getUnimplementedDecoder('TransactionVersion'),
        serialize,
    };
}

export function getTransactionVersionCodec(): Serializer<TransactionVersion> {
    return {
        ...BASE_CONFIG,
        deserialize,
        serialize,
    };
}
