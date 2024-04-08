import { ReadonlyUint8Array, VariableSizeEncoder } from '@solana/codecs-core';

import { NewTransaction, TransactionMessageBytes } from '../../transaction';
import { getSignaturesEncoder } from '../signatures-encoder';
import { getNewTransactionEncoder } from '../transaction-codec';

jest.mock('../signatures-encoder');

describe('getNewTransactionEncoder', () => {
    const mockEncodedSignatures = new Uint8Array([1, 2, 3]);
    let encoder: VariableSizeEncoder<NewTransaction>;
    beforeEach(() => {
        (getSignaturesEncoder as jest.Mock).mockReturnValue({
            getSizeFromValue: jest.fn().mockReturnValue(mockEncodedSignatures.length),
            write: jest.fn().mockImplementation((_value, bytes: Uint8Array, offset: number) => {
                bytes.set(mockEncodedSignatures, offset);
                return offset + mockEncodedSignatures.length;
            }),
        });
        encoder = getNewTransactionEncoder();
    });

    it('should encode the transaction correctly', () => {
        const messageBytes = new Uint8Array([4, 5, 6]) as ReadonlyUint8Array as TransactionMessageBytes;

        const transaction: NewTransaction = {
            messageBytes,
            signatures: {},
        };

        expect(encoder.encode(transaction)).toStrictEqual(
            new Uint8Array([
                /* signatures */
                ...mockEncodedSignatures,
                /* message bytes */
                ...messageBytes,
            ]),
        );
    });
});
