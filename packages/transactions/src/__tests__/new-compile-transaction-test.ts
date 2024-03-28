import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';

import { CompiledMessage, compileMessage } from '../message';
import { compileTransactionMessage } from '../new-compile-transaction';
import { getCompiledMessageEncoder } from '../serializers';

jest.mock('../message');
jest.mock('../serializers/message');

type TransactionMessage = Parameters<typeof compileTransactionMessage>[0];

describe('compileTransactionMessage', () => {
    const mockAddressA = '1111' as Address;
    const mockAddressB = '2222' as Address;
    const mockCompiledMessage = {
        header: {
            numSignerAccounts: 2,
        },
        staticAccounts: [mockAddressA, mockAddressB],
    } as CompiledMessage;
    const mockCompiledMessageBytes = new Uint8Array(Array(100)).fill(1);
    beforeEach(() => {
        (compileMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
        (getCompiledMessageEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue(mockCompiledMessageBytes),
        });
    });

    it('compiles the transaction message', () => {
        const transaction = compileTransactionMessage({} as TransactionMessage);
        expect(transaction).toHaveProperty('messageBytes', mockCompiledMessageBytes);
    });
    it('compiles an array of signatures the length of the number of signers', () => {
        const transaction = compileTransactionMessage({} as TransactionMessage);
        expect(Object.keys(transaction.signatures)).toHaveLength(mockCompiledMessage.header.numSignerAccounts);
    });
    it("inserts signers into the correct position in the signatures' array", () => {
        const transaction = compileTransactionMessage({} as TransactionMessage);
        expect(Object.keys(transaction.signatures)).toStrictEqual([
            // Two signers, in the order they're found in `mockCompiledMessage.staticAccounts`
            mockAddressA,
            mockAddressB,
        ]);
    });
    it('inserts a null signature into the map for each signer', () => {
        const transaction = compileTransactionMessage({} as TransactionMessage);
        expect(Object.values(transaction.signatures)).toStrictEqual([null, null]);
    });
    it('freezes the returned transaction', () => {
        const transaction = compileTransactionMessage({} as TransactionMessage);
        expect(transaction).toBeFrozenObject();
    });
});
