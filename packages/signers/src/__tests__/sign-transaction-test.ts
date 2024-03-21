import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING,
    SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
    SolanaError,
} from '@solana/errors';
import { CompilableTransaction, IFullySignedTransaction, ITransactionWithSignatures } from '@solana/transactions';

import {
    partiallySignTransactionWithSigners,
    signAndSendTransactionWithSigners,
    signTransactionWithSigners,
} from '../sign-transaction';
import {
    assertIsTransactionWithSingleSendingSigner,
    ITransactionWithSingleSendingSigner,
} from '../transaction-with-single-sending-signer';
import {
    createMockTransactionCompositeSigner,
    createMockTransactionModifyingSigner,
    createMockTransactionPartialSigner,
    createMockTransactionSendingSigner,
    createMockTransactionWithSigners,
} from './__setup__';

describe('partiallySignTransactionWithSigners', () => {
    it('signs the transaction with its extracted signers', async () => {
        expect.assertions(3);

        // Given a transaction with two signers A and B in its account metas.
        const signerA = createMockTransactionModifyingSigner('1111' as Address);
        const signerB = createMockTransactionPartialSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given signer A and B are mocked to provide the following signatures.
        const modifiedTransaction = { ...transaction, signatures: { '1111': '1111_signature' } };
        signerA.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);
        signerB.signTransactions.mockResolvedValueOnce([{ '2222': '2222_signature' }]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });

        // And the signers were called with the expected parameters.
        expect(signerA.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerB.signTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });
    });

    it('signs modifying signers before partial signers', async () => {
        expect.assertions(2);

        // Given a modifying signer A and a partial signer B.
        const signerA = createMockTransactionModifyingSigner('1111' as Address);
        const signerB = createMockTransactionPartialSigner('2222' as Address);

        // And mock implementations for both signers such that they append events to an array.
        const events: string[] = [];
        signerA.modifyAndSignTransactions.mockImplementation((transactions: CompilableTransaction[]) => {
            events.push('signerA');
            return transactions.map(tx => ({ ...tx, signatures: { '1111': '1111_signature' } }));
        });
        signerB.signTransactions.mockImplementation((transactions: CompilableTransaction[]) => {
            events.push('signerB');
            return transactions.map(() => ({ '2222': '2222_signature' }));
        });

        // And given a transaction that contains theses signers in its account metas (in any order).
        const transaction = createMockTransactionWithSigners([signerB, signerA]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then the modifying signer was called before the partial signer.
        expect(events).toStrictEqual(['signerA', 'signerB']);

        // And it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });
    });

    it('signs modifying signers sequentially', async () => {
        expect.assertions(2);

        // Given two modifying signers A and B.
        const signerA = createMockTransactionModifyingSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);

        // And mock implementations for both signers such that they append events to an array.
        const events: string[] = [];
        const mockImplementation =
            (signerId: string, address: string) =>
            async (transactions: (CompilableTransaction & Partial<ITransactionWithSignatures>)[]) => {
                events.push(`${signerId} starts`);
                await new Promise(r => setTimeout(r, 500));
                events.push(`${signerId} ends`);
                return transactions.map(tx => ({
                    ...tx,
                    signatures: { ...tx.signatures, [address]: `${address}_signature` },
                }));
            };
        signerA.modifyAndSignTransactions.mockImplementation(mockImplementation('signerA', '1111'));
        signerB.modifyAndSignTransactions.mockImplementation(mockImplementation('signerB', '2222'));

        // And given a transaction that contains theses two signers in its account metas.
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then the first modifying signer finished signing before the second one started.
        expect(events).toStrictEqual(['signerA starts', 'signerA ends', 'signerB starts', 'signerB ends']);

        // And it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });
    });

    it('signs partial signers in parallel', async () => {
        expect.assertions(2);

        // Given two partial signers A and B.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionPartialSigner('2222' as Address);

        // And mock implementations for both signers such that they append events to an array.
        const events: string[] = [];
        const mockImplementation =
            (signerId: string, address: string, timeout: number) =>
            async (transactions: (CompilableTransaction & Partial<ITransactionWithSignatures>)[]) => {
                events.push(`${signerId} starts`);
                await new Promise(r => setTimeout(r, timeout));
                events.push(`${signerId} ends`);
                return transactions.map(() => ({ [address]: `${address}_signature` }));
            };
        signerA.signTransactions.mockImplementation(mockImplementation('signerA', '1111', 500));
        signerB.signTransactions.mockImplementation(mockImplementation('signerB', '2222', 600));

        // And given a transaction that contains theses two signers in its account metas.
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then the second partial signer started signing before the first one finished.
        expect(events).toStrictEqual(['signerA starts', 'signerB starts', 'signerA ends', 'signerB ends']);

        // And it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });
    });

    it('ignores sending signers', async () => {
        expect.assertions(4);

        // Given a transaction with a sending signer A and a composite signer B
        // which is both a sending signer and a partial signer.
        const signerA = createMockTransactionSendingSigner('1111' as Address);
        const signerB = {
            ...createMockTransactionSendingSigner('2222' as Address),
            ...createMockTransactionPartialSigner('2222' as Address),
        };
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given signer B's partial interface is mocked to provide the following signatures.
        signerB.signTransactions.mockResolvedValueOnce([{ '2222': '2222_signature' }]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then it only contains signer B's signature.
        expect(signedTransaction.signatures).toStrictEqual({ '2222': '2222_signature' });

        // And only the partial signer function was called.
        expect(signerB.signTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerA.signAndSendTransactions).not.toHaveBeenCalled();
        expect(signerB.signAndSendTransactions).not.toHaveBeenCalled();
    });

    it('uses a composite signer as a modifying signer when there are no other modifying signers', async () => {
        expect.assertions(4);

        // Given a transaction with a composite (partial & modifying) signer A and a partial signer B.
        const signerA = {
            ...createMockTransactionPartialSigner('1111' as Address),
            ...createMockTransactionModifyingSigner('1111' as Address),
        };
        const signerB = createMockTransactionPartialSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given the following mocked signatures.
        const modifiedTransaction = { ...transaction, signatures: { '1111': '1111_signature' } };
        signerA.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);
        signerB.signTransactions.mockResolvedValueOnce([{ '2222': '2222_signature' }]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then signer A was used as a modifying signer.
        expect(signerA.signTransactions).not.toHaveBeenCalled();
        expect(signerA.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerB.signTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });

        // And it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });
    });

    it('uses a composite signer as a partial signer when other modifying signers exist', async () => {
        expect.assertions(4);

        // Given a transaction with a composite (partial & modifying) signer A and a modifying signer B.
        const signerA = {
            ...createMockTransactionPartialSigner('1111' as Address),
            ...createMockTransactionModifyingSigner('1111' as Address),
        };
        const signerB = createMockTransactionModifyingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given the following mocked signatures.
        const modifiedTransaction = { ...transaction, signatures: { '2222': '2222_signature' } };
        signerA.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        signerB.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then signer A was used as a partial signer.
        expect(signerA.signTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });
        expect(signerA.modifyAndSignTransactions).not.toHaveBeenCalled();
        expect(signerB.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });

        // And it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });
    });

    it('freezes the signed transaction and its signature dictionary', async () => {
        expect.assertions(2);

        // Given a transaction with a mocked partial signer.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const transaction = createMockTransactionWithSigners([signer]);
        signer.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);

        // When we partially sign this transaction.
        const signedTransaction = await partiallySignTransactionWithSigners(transaction);

        // Then the signed transaction and its signature dictionary are frozen.
        expect(signedTransaction).toBeFrozenObject();
        expect(signedTransaction.signatures).toBeFrozenObject();
    });

    it('can be cancelled using an AbortSignal', async () => {
        expect.assertions(1);

        // Given a transaction with a mocked partial signer.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        signer.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        const transaction = createMockTransactionWithSigners([signer]);

        // And given we've started partially signing this transaction whilst providing an abort signal.
        const abortController = new AbortController();
        const promise = partiallySignTransactionWithSigners(transaction, {
            abortSignal: abortController.signal,
        });

        // When we cancel the operation via the abort controller.
        abortController.abort();

        // Then we expect the partially signing promise to fail.
        await expect(promise).rejects.toThrow(/(The|This) operation was aborted/);
    });
});

describe('signTransactionWithSigners', () => {
    it('signs the transaction with its extracted signers', async () => {
        expect.assertions(3);

        // Given a transaction with two signers A and B in its account metas.
        const signerA = createMockTransactionModifyingSigner('1111' as Address);
        const signerB = createMockTransactionPartialSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given signer A and B are mocked to provide the following signatures.
        const modifiedTransaction = { ...transaction, signatures: { '1111': '1111_signature' } };
        signerA.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);
        signerB.signTransactions.mockResolvedValueOnce([{ '2222': '2222_signature' }]);

        // When we sign this transaction.
        const signedTransaction = await signTransactionWithSigners(transaction);

        // Then it contains the expected signatures.
        expect(signedTransaction.signatures).toStrictEqual({
            '1111': '1111_signature',
            '2222': '2222_signature',
        });

        // And the transaction is fully signed.
        signedTransaction satisfies IFullySignedTransaction;

        // And the signers were called with the expected parameters.
        expect(signerA.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerB.signTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });
    });

    it('asserts the transaction is fully signed', async () => {
        expect.assertions(1);

        // Given a transaction with a partial signer A and a sending signer B.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given signer A is mocked to provide the following signatures.
        signerA.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);

        // When we try to sign this transaction.
        const promise = signTransactionWithSigners(transaction);

        // Then we expect an error letting us know the transaction is not fully signed.
        // This is because sending signers are ignored by signTransactionWithSigners.
        await expect(promise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
                addresses: ['2222' as Address],
            }),
        );
    });

    it('can be cancelled using an AbortSignal', async () => {
        expect.assertions(1);

        // Given a transaction with a mocked partial signer.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        signer.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        const transaction = createMockTransactionWithSigners([signer]);

        // And given we've started signing this transaction whilst providing an abort signal.
        const abortController = new AbortController();
        const promise = signTransactionWithSigners(transaction, {
            abortSignal: abortController.signal,
        });

        // When we cancel the operation via the abort controller.
        abortController.abort();

        // Then we expect the signing promise to fail.
        await expect(promise).rejects.toThrow(/(The|This) operation was aborted/);
    });
});

describe('signAndSendTransactionWithSigners', () => {
    it('signs and sends the transaction with the provided signers', async () => {
        expect.assertions(3);

        // Given a transaction with a partial signer A and a sending signer B.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given signer A and B are mocked to provide the following return values.
        signerA.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        signerB.signAndSendTransactions.mockResolvedValueOnce([new Uint8Array([1, 2, 3])]);

        // When we sign and send this transaction.
        assertIsTransactionWithSingleSendingSigner(transaction);
        const transactionSignature = await signAndSendTransactionWithSigners(transaction);

        // Then the sending signer was used to send the transaction.
        expect(signerA.signTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerB.signAndSendTransactions).toHaveBeenCalledWith(
            [{ ...transaction, signatures: { '1111': '1111_signature' } }],
            { abortSignal: undefined },
        );

        // And the returned signature matches the one returned by the sending signer.
        expect(transactionSignature).toStrictEqual(new Uint8Array([1, 2, 3]));
    });

    it('fails if no sending signer exists on the transaction', async () => {
        expect.assertions(1);

        // Given a transaction with a mocked partial signer but no sending signer.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        signer.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        const transaction = createMockTransactionWithSigners([signer]);

        // When we try to force sign and send this transaction.
        const promise = signAndSendTransactionWithSigners(
            transaction as ITransactionWithSingleSendingSigner & typeof transaction,
        );

        // Then we expect an error letting us know no sending mechanism was provided.
        await expect(promise).rejects.toThrow(
            new SolanaError(SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING),
        );
    });

    it('uses a composite signer as a sending signer when there are no other sending signers', async () => {
        expect.assertions(4);

        // Given a transaction with a composite (partial, modifying & sending) signer A and a partial signer B.
        const signerA = createMockTransactionCompositeSigner('1111' as Address);
        const signerB = createMockTransactionPartialSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);
        signerA.signAndSendTransactions.mockResolvedValueOnce([new Uint8Array([1, 2, 3])]);
        signerB.signTransactions.mockResolvedValueOnce([{ '2222': '2222_signature' }]);

        // When we sign and send this transaction.
        assertIsTransactionWithSingleSendingSigner(transaction);
        const transactionSignature = await signAndSendTransactionWithSigners(transaction);

        // Then the composite signer was used as a sending signer.
        expect(signerA.signAndSendTransactions).toHaveBeenCalledWith(
            [{ ...transaction, signatures: { '2222': '2222_signature' } }],
            { abortSignal: undefined },
        );
        expect(signerA.signTransactions).not.toHaveBeenCalled();
        expect(signerA.modifyAndSignTransactions).not.toHaveBeenCalled();

        // And the returned signature matches the one returned by that sending signer.
        expect(transactionSignature).toStrictEqual(new Uint8Array([1, 2, 3]));
    });

    it('uses a composite signer as a modifying signer when there are no other modifying signers', async () => {
        expect.assertions(5);

        // Given a transaction with a composite (partial, modifying & sending) signer A and a sending signer B.
        const signerA = createMockTransactionCompositeSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB]);

        // And given the following mocked signatures for these signers.
        const modifiedTransaction = { ...transaction, signatures: { '1111': '1111_signature' } };
        signerA.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);
        signerB.signAndSendTransactions.mockResolvedValueOnce([new Uint8Array([1, 2, 3])]);

        // When we sign and send this transaction.
        assertIsTransactionWithSingleSendingSigner(transaction);
        const transactionSignature = await signAndSendTransactionWithSigners(transaction);

        // Then the composite signer was used as a modifying signer.
        expect(signerA.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(signerA.signTransactions).not.toHaveBeenCalled();
        expect(signerA.signAndSendTransactions).not.toHaveBeenCalled();

        // And the sending only signer was used to send the transaction.
        expect(transactionSignature).toStrictEqual(new Uint8Array([1, 2, 3]));
        expect(signerB.signAndSendTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });
    });

    it('uses a composite signer as a partial signer when other sending and modifying signers exist', async () => {
        expect.assertions(6);

        // Given a transaction with a composite (partial, modifying & sending) signer A,
        // a sending signer B and a modifying signer C.
        const signerA = createMockTransactionCompositeSigner('1111' as Address);
        const signerB = createMockTransactionSendingSigner('2222' as Address);
        const signerC = createMockTransactionModifyingSigner('3333' as Address);
        const transaction = createMockTransactionWithSigners([signerA, signerB, signerC]);

        // And given the following mocked signatures for these signers.
        signerA.signTransactions.mockResolvedValueOnce([{ '1111': '1111_signature' }]);
        signerB.signAndSendTransactions.mockResolvedValueOnce([new Uint8Array([1, 2, 3])]);
        const modifiedTransaction = { ...transaction, signatures: { '3333': '3333_signature' } };
        signerC.modifyAndSignTransactions.mockResolvedValueOnce([modifiedTransaction]);

        // When we sign and send this transaction.
        assertIsTransactionWithSingleSendingSigner(transaction);
        const transactionSignature = await signAndSendTransactionWithSigners(transaction);

        // Then the composite signer was used as a partial signer.
        expect(signerA.signTransactions).toHaveBeenCalledWith([modifiedTransaction], { abortSignal: undefined });
        expect(signerA.modifyAndSignTransactions).not.toHaveBeenCalled();
        expect(signerA.signAndSendTransactions).not.toHaveBeenCalled();

        // And the other signers were used as expected.
        expect(signerC.modifyAndSignTransactions).toHaveBeenCalledWith([transaction], { abortSignal: undefined });
        expect(transactionSignature).toStrictEqual(new Uint8Array([1, 2, 3]));
        expect(signerB.signAndSendTransactions).toHaveBeenCalledWith(
            [{ ...transaction, signatures: { '1111': '1111_signature', '3333': '3333_signature' } }],
            { abortSignal: undefined },
        );
    });

    it('can be cancelled using an AbortSignal', async () => {
        expect.assertions(1);

        // Given a transaction with a mocked sending signer.
        const signer = createMockTransactionSendingSigner('1111' as Address);
        signer.signAndSendTransactions.mockResolvedValueOnce([new Uint8Array([1, 2, 3])]);
        const transaction = createMockTransactionWithSigners([signer]);

        // And given we've started signing this transaction whilst providing an abort signal.
        const abortController = new AbortController();
        assertIsTransactionWithSingleSendingSigner(transaction);
        const promise = signAndSendTransactionWithSigners(transaction, {
            abortSignal: abortController.signal,
        });

        // When we cancel the operation via the abort controller.
        abortController.abort();

        // Then we expect the signing promise to fail.
        await expect(promise).rejects.toThrow(/(The|This) operation was aborted/);
    });
});
