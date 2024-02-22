import type { Commitment } from '@solana/rpc-types';

describe('getBlocksWithLimit', () => {
    (['confirmed', 'finalized'] as Exclude<Commitment, 'processed'>[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            describe('when called with a valid `startSlot` and a valid `limit`', () => {
                // On the test validator, finalized blocks tend to be available ~35 slots
                // after the current confirmed slot.
                // So we'll have to wait for a few blocks to be confirmed before we can test this.
                it.todo('returns 5 blocks for a limit of 5');
            });

            describe('when called with a valid `startSlot` and a `limit` of 0', () => {
                it.todo('returns an empty array');
            });

            describe('when called with a `limit` resulting in a slot higher than the highest slot available', () => {
                // TODO: We need to be able to deterministically set the highest slot
                // so we can test against it, but without making an RPC call like
                // `getSlot` which would defeat the purpose of this test.
                it.todo('returns up to the highest slot available');
            });

            describe('when called with a `startSlot` higher than the highest slot available', () => {
                it.todo('returns an empty array');
            });

            describe('when called with a `limit` higher than 500,000', () => {
                it.todo('throws an error');
            });
        });
    });
});
