import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getVoteAccounts', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns current and delinquent vote accounts', async () => {
                expect.assertions(1);
                const voteAccountsPromise = rpc.getVoteAccounts().send();
                await expect(voteAccountsPromise).resolves.toMatchObject({
                    current: expect.any(Array),
                    delinquent: expect.any(Array),
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
                '2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2' as Base58EncodedAddress<'2eTCZxWZkU5h3Mo162gLRTECzuJhPgC1McB9rCcoqNm2'>;
            const voteAccountsPromise = rpc.getVoteAccounts({ votePubkey: address }).send();
            await expect(voteAccountsPromise).resolves.toMatchObject({
                current: [],
                delinquent: [],
            });
        });
    });

    describe('when called with `keepUnstakedDelinquents` set to false', () => {
        it.todo('filters out delinquent vote accounts with `activeStake` of 0');
    });
});
