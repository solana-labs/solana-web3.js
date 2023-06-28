import { Serializer } from '@metaplex-foundation/umi-serializers';

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
    'Transaction version serializer',
    serializerFactory => {
        let transactionVersion: Serializer<TransactionVersion>;
        beforeEach(() => {
            transactionVersion = serializerFactory();
        });
        it('serializes no data when the version is `legacy`', () => {
            expect(transactionVersion.serialize('legacy')).toEqual(new Uint8Array());
        });
        it.each(VERSION_TEST_CASES)('serializes to `%s` when the version is `%s`', (expected, version) => {
            expect(transactionVersion.serialize(version)).toEqual(new Uint8Array([expected]));
        });
        it.each([-1 as TransactionVersion, 128 as TransactionVersion])(
            'throws when passed the out-of-range version `%s`',
            version => {
                expect(() => transactionVersion.serialize(version)).toThrow();
            }
        );
    }
);

describe.each([getTransactionVersionCodec, getTransactionVersionDecoder])(
    'Transaction version deserializer',
    serializerFactory => {
        let transactionVersion: Serializer<TransactionVersion>;
        beforeEach(() => {
            transactionVersion = serializerFactory();
        });
        it.each(VERSION_TEST_CASES)('deserializes `%s` to the version `%s`', (byte, expected) => {
            expect(transactionVersion.deserialize(new Uint8Array([byte]))[0]).toEqual(expected);
        });
        it('deserializes to `legacy` when missing the version flag', () => {
            expect(
                transactionVersion.deserialize(
                    // eg. just a byte that indicates that there are 3 required signers
                    new Uint8Array([3])
                )[0]
            ).toBe('legacy');
        });
    }
);

describe('The transaction version decode-only factory', () => {
    it('throws when you call `serialize`', () => {
        expect(getTransactionVersionDecoder().serialize).toThrowErrorMatchingInlineSnapshot(
            `"No encoder exists for TransactionVersion. Use \`getTransactionVersionEncoder()\` if you need a encoder, and \`getTransactionVersionCodec()\` if you need to both encode and decode TransactionVersion"`
        );
    });
});

describe('The transaction version encode-only factory', () => {
    it('throws when you call `deserialize`', () => {
        expect(getTransactionVersionEncoder().deserialize).toThrowErrorMatchingInlineSnapshot(
            `"No decoder exists for TransactionVersion. Use \`getTransactionVersionDecoder()\` if you need a decoder, and \`getTransactionVersionCodec()\` if you need to both encode and decode TransactionVersion"`
        );
    });
});
