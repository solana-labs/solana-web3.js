import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Commitment, Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetSupplyApi } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getSupply', () => {
    let rpc: Rpc<GetSupplyApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetSupplyApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the supply', async () => {
                expect.assertions(1);
                const supply = await rpc.getSupply({ commitment }).send();

                expect(supply).toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        circulating: expect.any(BigInt),
                        nonCirculating: expect.any(BigInt),
                        nonCirculatingAccounts: expect.arrayContaining([expect.any(String)]),
                        total: expect.any(BigInt),
                    },
                });

                // TODO: we don't reliably have non-circulating accounts in test validator yet
                // expect(supply.value.nonCirculatingAccounts.length).toBeGreaterThan(0);
            });
        });
    });

    describe('when called with `excludeNonCirculatingAccountsList: true`', () => {
        it.todo('returns an empty `nonCirculatingAccounts` array');
    });

    describe('when called with `excludeNonCirculatingAccountsList: false`', () => {
        it.todo('returns a non-empty `nonCirculatingAccounts` array');
    });
});
