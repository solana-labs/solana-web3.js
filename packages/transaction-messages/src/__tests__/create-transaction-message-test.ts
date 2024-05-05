import '@solana/test-matchers/toBeFrozenObject';

import { createTransactionMessage } from '../create-transaction-message';

describe('createTransactionMessage', () => {
    it('creates a legacy transaction', () => {
        expect(createTransactionMessage({ version: 'legacy' })).toMatchObject({
            instructions: [],
            version: 'legacy',
        });
    });
    it('creates a v0 transaction', () => {
        expect(createTransactionMessage({ version: 0 })).toMatchObject({
            instructions: [],
            version: 0,
        });
    });
    it('freezes the object', () => {
        const tx = createTransactionMessage({ version: 0 });
        expect(tx).toBeFrozenObject();
    });
    it('freezes the instructions array', () => {
        const tx = createTransactionMessage({ version: 0 });
        expect(tx.instructions).toBeFrozenObject();
    });
});
