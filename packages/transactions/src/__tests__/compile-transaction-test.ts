import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { Blockhash } from '@solana/rpc-types';
import {
    CompiledTransactionMessage,
    getCompiledTransactionMessageEncoder,
    newCompileTransactionMessage,
    NewNonce,
} from '@solana/transaction-messages';

import { compileTransaction } from '../compile-transaction';

jest.mock('@solana/transaction-messages', () => ({
    ...jest.requireActual('@solana/transaction-messages'),
    getCompiledTransactionMessageEncoder: jest.fn(),
    newCompileTransactionMessage: jest.fn(),
}));

type TransactionMessage = Parameters<typeof compileTransaction>[0];

describe('compileTransactionMessage', () => {
    const mockAddressA = '2aaa' as Address;
    const mockAddressB = '1aaa' as Address;
    const mockCompiledMessage = {
        header: {
            numReadonlyNonSignerAccounts: 0,
            numReadonlySignerAccounts: 0,
            numSignerAccounts: 2,
        },
        instructions: [],
        lifetimeToken: 'a',
        staticAccounts: [mockAddressA, mockAddressB],
        version: 0,
    } as CompiledTransactionMessage;
    const mockCompiledMessageBytes = new Uint8Array(Array(100)).fill(1);
    beforeEach(() => {
        (newCompileTransactionMessage as jest.Mock).mockReturnValue(mockCompiledMessage);
        (getCompiledTransactionMessageEncoder as jest.Mock).mockReturnValue({
            encode: jest.fn().mockReturnValue(mockCompiledMessageBytes),
        });
    });

    const emptyMockTransactionMessage = {
        lifetimeConstraint: {
            blockhash: '4'.repeat(44) as Blockhash,
            lastValidBlockHeight: 1n,
        },
    } as TransactionMessage;

    it('compiles the supplied `TransactionMessage` and sets the `messageBytes` property to the result', () => {
        const transaction = compileTransaction(emptyMockTransactionMessage);
        expect(transaction).toHaveProperty('messageBytes', mockCompiledMessageBytes);
    });
    it('compiles an array of signatures the length of the number of signers', () => {
        const transaction = compileTransaction(emptyMockTransactionMessage);
        expect(Object.keys(transaction.signatures)).toHaveLength(mockCompiledMessage.header.numSignerAccounts);
    });
    it("inserts signers into the correct position in the signatures' array", () => {
        const transaction = compileTransaction(emptyMockTransactionMessage);
        expect(Object.keys(transaction.signatures)).toStrictEqual([
            // Two signers, in the order they're found in `mockCompiledMessage.staticAccounts`
            mockAddressA,
            mockAddressB,
        ]);
    });
    it('inserts a null signature into the map for each signer', () => {
        const transaction = compileTransaction(emptyMockTransactionMessage);
        expect(Object.values(transaction.signatures)).toStrictEqual([null, null]);
    });
    it('freezes the returned transaction', () => {
        const transaction = compileTransaction(emptyMockTransactionMessage);
        expect(transaction).toBeFrozenObject();
    });

    it('returns a blockhash lifetime constraint when the transaction message has a blockhash constraint', () => {
        const transactionMessage = {
            lifetimeConstraint: {
                blockhash: 'D5vmAVFNZFaBBZNJ17tMaVrcsQ9DZViL9bAZn1n1Kxer' as Blockhash,
                lastValidBlockHeight: 1n,
            },
        } as TransactionMessage;
        const transaction = compileTransaction(transactionMessage);
        expect(transaction.lifetimeConstraint).toStrictEqual({
            blockhash: 'D5vmAVFNZFaBBZNJ17tMaVrcsQ9DZViL9bAZn1n1Kxer' as Blockhash,
            lastValidBlockHeight: 1n,
        });
    });

    it('returns a durable nonce lifetime constraint when the transaction message has a nonce constraint', () => {
        const transactionMessage = {
            instructions: [
                {
                    accounts: [
                        {
                            address: 'nonceAddress' as Address,
                        },
                    ],
                },
            ],
            lifetimeConstraint: {
                nonce: 'b' as NewNonce,
            },
        } as unknown as TransactionMessage;
        const transaction = compileTransaction(transactionMessage);
        expect(transaction.lifetimeConstraint).toStrictEqual({
            nonce: 'b' as NewNonce,
            nonceAccountAddress: 'nonceAddress',
        });
    });
});
