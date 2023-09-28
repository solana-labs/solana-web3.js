import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { fromOldVersionedTransactionWithBlockhash } from '../transaction';

describe('fromOldVersionedTransaction', () => {
    const lastValidBlockHeight = 1000n;

    const feePayerString = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK';
    const feePayerPublicKey = new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK');

    const blockhashString = 'J4yED2jcMAHyQUg61DBmm4njmEydUr2WqrV9cdEcDDgL';

    describe('for a transaction with `legacy` version', () => {
        it('converts a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            expect(transaction.version).toBe('legacy');
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight,
            });
        });
    });

    describe('for a transaction with `0` version', () => {
        it('converts a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            expect(transaction.version).toBe(0);
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight,
            });
        });
    });
});
