import { Decoder, Encoder } from '@solana/codecs-core';

import { TransactionVersion } from '../../types';
import {
    getTransactionVersionCodec,
    getTransactionVersionDecoder,
    getTransactionVersionEncoder,
} from '../transaction-version';

const VERSION_FLAG_MASK = 0x80;
const VERSION_TEST_CASES = // Versions 0–127
    [...Array(128).keys()].map(version => [version | VERSION_FLAG_MASK, version as TransactionVersion] as const);

describe.each([getTransactionVersionCodec, getTransactionVersionEncoder])(
    'Transaction version encoder',
    serializerFactory => {
        let transactionVersion: Encoder<TransactionVersion>;
        beforeEach(() => {
            transactionVersion = serializerFactory();
        });
        it('serializes no data when the version is `legacy`', () => {
            expect(transactionVersion.encode('legacy')).toEqual(new Uint8Array());
        });
        it.each(VERSION_TEST_CASES)('serializes to `%s` when the version is `%s`', (expected, version) => {
            expect(transactionVersion.encode(version)).toEqual(new Uint8Array([expected]));
        });
        it.each([-1 as TransactionVersion, 128 as TransactionVersion])(
            'throws when passed the out-of-range version `%s`',
            version => {
                expect(() => transactionVersion.encode(version)).toThrow();
            },
        );
    },
);

describe.each([getTransactionVersionCodec, getTransactionVersionDecoder])(
    'Transaction version decoder',
    serializerFactory => {
        let transactionVersion: Decoder<TransactionVersion>;
        beforeEach(() => {
            transactionVersion = serializerFactory();
        });
        it.each(VERSION_TEST_CASES)('deserializes `%s` to the version `%s`', (byte, expected) => {
            expect(transactionVersion.decode(new Uint8Array([byte]))).toEqual(expected);
        });
        it('deserializes to `legacy` when missing the version flag', () => {
            expect(
                transactionVersion.decode(
                    // eg. just a byte that indicates that there are 3 required signers
                    new Uint8Array([3]),
                ),
            ).toBe('legacy');
        });
    },
);
