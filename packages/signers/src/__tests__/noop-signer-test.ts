import '@solana/test-matchers/toBeFrozenObject';

import { address } from '@solana/addresses';
import { CompilableTransaction } from '@solana/transactions';

import { createNoopSigner, NoopSigner } from '../noop-signer';
import { createSignableMessage } from '../signable-message';

describe('createNoopSigner', () => {
    it('creates a NoopSigner from a given address', () => {
        // Given a base58 encoded address.
        const myAddress = address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy');

        // When we create a NoopSigner from that address.
        const mySigner = createNoopSigner(myAddress);
        mySigner satisfies NoopSigner;

        // Then the created signer kept track of the address.
        expect(mySigner.address).toBe(myAddress);

        // And provided functions to sign messages and transactions.
        expect(typeof mySigner.signMessages).toBe('function');
        expect(typeof mySigner.signTransactions).toBe('function');
    });

    it('freezes the created signer', () => {
        const mySigner = createNoopSigner(address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'));
        expect(mySigner).toBeFrozenObject();
    });

    it('returns an empty signature directory when signing messages', async () => {
        expect.assertions(4);

        // Given a NoopSigner.
        const mySigner = createNoopSigner(address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'));

        // When we sign two messages using that signer.
        const messages = [createSignableMessage('hello'), createSignableMessage('world')];
        const signatureDictionaries = await mySigner.signMessages(messages);

        // Then the signature directories are empty and frozen.
        expect(signatureDictionaries[0]).toStrictEqual({});
        expect(signatureDictionaries[1]).toStrictEqual({});
        expect(signatureDictionaries[0]).toBeFrozenObject();
        expect(signatureDictionaries[1]).toBeFrozenObject();
    });

    it('returns an empty signature directory when signing transactions', async () => {
        expect.assertions(4);

        // Given a NoopSigner.
        const mySigner = createNoopSigner(address('Gp7YgHcJciP4px5FdFnywUiMG4UcfMZV9UagSAZzDxdy'));

        // And given we have a couple of mock transactions to sign.
        const mockTransactions = [{} as CompilableTransaction, {} as CompilableTransaction];

        // When we sign both transactions using that signer.
        const signatureDictionaries = await mySigner.signTransactions(mockTransactions);

        // Then the signature directories are empty and frozen.
        expect(signatureDictionaries[0]).toStrictEqual({});
        expect(signatureDictionaries[1]).toStrictEqual({});
        expect(signatureDictionaries[0]).toBeFrozenObject();
        expect(signatureDictionaries[1]).toBeFrozenObject();
    });
});
