import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getLargestAccounts', () => {
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
            describe('when called without filter', () => {
                it('returns a list of the largest accounts', async () => {
                    expect.assertions(1);
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment }).send();
                    await expect(largestAcountsPromise).resolves.toMatchObject({
                        context: {
                            slot: expect.any(BigInt),
                        },
                        value: expect.arrayContaining([
                            {
                                address: expect.any(String),
                                lamports: expect.any(BigInt),
                            },
                        ]),
                    });
                });
            });

            describe('when called with the `circulating` filter', () => {
                it('returns a list of the largest circulating accounts', async () => {
                    expect.assertions(1);
                    const largestAcountsPromise = rpc.getLargestAccounts({ commitment, filter: 'circulating' }).send();
                    await expect(largestAcountsPromise).resolves.toMatchObject({
                        context: {
                            slot: expect.any(BigInt),
                        },
                        value: expect.arrayContaining([
                            {
                                address: expect.any(String),
                                lamports: expect.any(BigInt),
                            },
                        ]),
                    });
                });
            });

            describe('when called with the `nonCirculating` filter', () => {
                // TODO: This will always be an empty array until we can mock it
                // with the test validator.
                it.todo('returns a list of the largest non-circulating accounts');
            });
        });
    });
});
