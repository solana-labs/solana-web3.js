import type { Address } from '@solana/addresses';
import type { Commitment } from '@solana/rpc-types';

describe('logsNotifications', () => {
    (
        ['all', 'allWithVotes', { mentions: ['Vote111111111111111111111111111111111111111'] as [Address] }] as (
            | 'all'
            | 'allWithVotes'
            | { mentions: [Address] }
        )[]
    ).forEach(filter => {
        // Note: Can't do finalized because it requires too much time to wait for the transaction to be finalized.
        // Note: processed is also unreliable because it requires non-vote transactions to occur after this subscription opens,
        // while confirmed can produce notifications for previously sent transactions that are confirmed in this subscription window.
        (['confirmed'] as Commitment[]).forEach(commitment => {
            describe(`with filter ${JSON.stringify(filter)} and commitment ${JSON.stringify(commitment)}`, () => {
                // Unfortunately, CI will run subscriptions tests _after_ HTTP, so there will be no logs to listen to.
                it.todo('produces logs notifications');
            });
        });
    });
    describe('for a failed transaction', () => {
        // TODO: Reproduce a failed transaction.
        // In this case, the logs would be null, and the `err` field would have an object
        it.todo('produces an error object and null logs');
    });
});
