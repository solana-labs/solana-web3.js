import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetVoteAccountsApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getVoteAccounts', () => {
    let rpc: Rpc<GetVoteAccountsApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns current and delinquent vote accounts', async () => {
                expect.assertions(1);
                const voteAccountsPromise = rpc.getVoteAccounts().send();
                await expect(voteAccountsPromise).resolves.toStrictEqual({
                    // FIXME: The legacy vote account tests add vote accounts to the local validator
                    //        (which is shared with this test) in such a way that makes a
                    //        `toStrictEqual()` assertion impossible here.
                    current: expect.arrayContaining([
                        {
                            // Fixture
                            activatedStake: expect.any(BigInt), // Changes
                            commission: 50,
                            epochCredits: expect.any(Array), // Changes
                            epochVoteAccount: true,
                            lastVote: expect.any(BigInt), // Changes
                            nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                            rootSlot: expect.any(BigInt), // Changes
                            votePubkey: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                        },
                    ]),
                    delinquent: expect.any(Array), // Changes
                });
            });

            // TODO: don't have a way to create vote accounts yet
            it.todo('returns vote accounts with the correct shape');
        });
    });

    describe('when called with a `votePubkey` of a single vote account', () => {
        it.todo('returns only that vote account');
    });

    describe('when called with a `votePubkey` of a vote account that does not exist', () => {
        it('returns empty `current` and `delinquent` fields', async () => {
            expect.assertions(1);
            // randomly generated address, don't re-use in anything that creates a vote account
            const address =
                '2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2' as Address<'2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2'>;
            const voteAccountsPromise = rpc.getVoteAccounts({ votePubkey: address }).send();
            await expect(voteAccountsPromise).resolves.toStrictEqual({
                current: [],
                delinquent: [],
            });
        });
    });

    describe('when called with `keepUnstakedDelinquents` set to false', () => {
        it.todo('filters out delinquent vote accounts with `activeStake` of 0');
    });
});
