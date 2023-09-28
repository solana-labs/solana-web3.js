import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { fromOldVersionedTransaction } from '../transaction';

describe('fromOldVersionedTransaction', () => {
    const feePayerString = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK';
    const feePayerPublicKey = new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK');

    it('returns a transaction with a `legacy` version', () => {
        const oldTransaction = new VersionedTransaction(
            new TransactionMessage({
                instructions: [],
                payerKey: feePayerPublicKey,
                recentBlockhash: undefined,
            }).compileToLegacyMessage()
        );

        const transaction = fromOldVersionedTransaction(oldTransaction);

        expect(transaction.version).toBe('legacy');
        expect(transaction.feePayer).toEqual(feePayerString);
    });

    it('returns a transaction with a `0` version', () => {
        const oldTransaction = new VersionedTransaction(
            new TransactionMessage({
                instructions: [],
                payerKey: feePayerPublicKey,
                recentBlockhash: undefined,
            }).compileToV0Message()
        );

        const transaction = fromOldVersionedTransaction(oldTransaction);

        expect(transaction.version).toBe(0);
        expect(transaction.feePayer).toEqual(feePayerString);
    });
});
