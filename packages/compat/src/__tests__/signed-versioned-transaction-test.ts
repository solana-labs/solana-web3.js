import { Keypair, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import {
    assertIsSignedVersionedTransaction,
    isSignedVersionedTransaction,
    signedVersionedTransaction,
} from '../signed-versioned-transaction';

describe('signed-versioned-transactions', () => {
    const payerKey = Keypair.generate().publicKey;
    const blockhashString = '4JgzET199353yzPPZ7QUAFa3FggaLmkeMczKwqW4VqTT';
    const signature = new Uint8Array(Array(64).fill(1));

    describe('isSignedVersionedTransaction', () => {
        it('returns false for a transaction with no signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );
            // the VersionedTransaction constructor sets an all-zero signature for payerKey
            transaction.signatures = [];
            expect(isSignedVersionedTransaction(transaction)).toBe(false);
        });

        it('returns false for a transaction with only all-zero signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message(),
                [new Uint8Array([0, 0, 0, 0])] // signatures
            );
            expect(isSignedVersionedTransaction(transaction)).toBe(false);
        });

        it('returns true for a transaction with a valid signature', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );
            transaction.addSignature(payerKey, signature);
            expect(isSignedVersionedTransaction(transaction)).toBe(true);
        });
    });

    describe('assertIsSignedVersionedTransaction', () => {
        it('throws for a transaction with no signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );
            // the VersionedTransaction constructor sets an all-zero signature for payerKey
            transaction.signatures = [];
            expect(() => {
                assertIsSignedVersionedTransaction(transaction);
            }).toThrow('Input transaction is not signed');
        });

        it('throws for a transaction with only all-zero signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message(),
                [new Uint8Array([0, 0, 0, 0])] // signatures
            );
            expect(() => {
                assertIsSignedVersionedTransaction(transaction);
            }).toThrow('Input transaction contains only all-zero signatures');
        });

        it('does not throw for a transaction with a valid signature', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message(),
                [new Uint8Array([0, 0, 0, 0])] // signatures
            );
            transaction.addSignature(payerKey, signature);
            expect(() => {
                assertIsSignedVersionedTransaction(transaction);
            }).not.toThrow();
        });
    });

    describe('signedVersionedTransaction', () => {
        it('throws for a transaction with no signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );
            // the VersionedTransaction constructor sets an all-zero signature for payerKey
            transaction.signatures = [];
            expect(() => {
                signedVersionedTransaction(transaction);
            }).toThrow('Input transaction is not signed');
        });

        it('throws for a transaction with only all-zero signatures', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message(),
                [new Uint8Array([0, 0, 0, 0])] // signatures
            );
            expect(() => {
                signedVersionedTransaction(transaction);
            }).toThrow('Input transaction contains only all-zero signatures');
        });

        it('returns the transaction when called for a transaction with a valid signature', () => {
            const transaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );
            transaction.addSignature(payerKey, signature);
            const signedTransaction = signedVersionedTransaction(transaction);
            expect(signedTransaction).toBe(transaction);
        });
    });
});
