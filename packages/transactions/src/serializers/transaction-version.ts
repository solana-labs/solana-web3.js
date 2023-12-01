import {
    combineCodec,
    createDecoder,
    createEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { TransactionVersion } from '../types';

const VERSION_FLAG_MASK = 0x80;

export function getTransactionVersionEncoder(): VariableSizeEncoder<TransactionVersion> {
    return createEncoder({
        getSizeFromValue: value => (value === 'legacy' ? 0 : 1),
        maxSize: 1,
        write: (value, bytes, offset) => {
            if (value === 'legacy') {
                return offset;
            }
            if (value < 0 || value > 127) {
                // TODO: Coded error.
                throw new Error(`Transaction version must be in the range [0, 127]. \`${value}\` given.`);
            }
            bytes.set([value | VERSION_FLAG_MASK], offset);
            return offset + 1;
        },
    });
}

export function getTransactionVersionDecoder(): VariableSizeDecoder<TransactionVersion> {
    return createDecoder({
        maxSize: 1,
        read: (bytes, offset) => {
            const firstByte = bytes[offset];
            if ((firstByte & VERSION_FLAG_MASK) === 0) {
                // No version flag set; it's a legacy (unversioned) transaction.
                return ['legacy', offset];
            } else {
                const version = (firstByte ^ VERSION_FLAG_MASK) as TransactionVersion;
                return [version, offset + 1];
            }
        },
    });
}

export function getTransactionVersionCodec(): VariableSizeCodec<TransactionVersion> {
    return combineCodec(getTransactionVersionEncoder(), getTransactionVersionDecoder());
}
