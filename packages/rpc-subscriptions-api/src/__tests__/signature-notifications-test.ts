import type { Commitment } from '@solana/rpc-types';

describe('signatureNotifications', () => {
    ([undefined, 'confirmed', 'finalized', 'processed'] as (Commitment | undefined)[]).forEach(commitment => {
        describe(`with commitment ${JSON.stringify(commitment)}`, () => {
            // TODO: No deterministic way to get a valid transaction signature without sending one
            it.todo('produces signature notifications');
        });
    });
    describe('on failed transaction', () => {
        it.todo('produces object transaction error');
    });
});
