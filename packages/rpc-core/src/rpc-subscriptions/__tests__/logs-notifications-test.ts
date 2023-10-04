import { Base58EncodedAddress } from '@solana/addresses';
import { createJsonSubscriptionRpc, createWebSocketTransport } from '@solana/rpc-transport';
import type { RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';
import { Commitment } from 'types';

import { createSolanaRpcSubscriptionsApi, SolanaRpcSubscriptions } from '../index';

describe('logsNotifications', () => {
    let rpc: RpcSubscriptions<SolanaRpcSubscriptions>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<SolanaRpcSubscriptions>({
            api: createSolanaRpcSubscriptionsApi(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    (
        [
            'all',
            'allWithVotes',
            { mentions: ['Vote111111111111111111111111111111111111111'] as [Base58EncodedAddress] },
        ] as ('all' | 'allWithVotes' | { mentions: [Base58EncodedAddress] })[]
    ).forEach(filter => {
        // Note: Can't do finalized because it requires too much time to wait for the transaction to be finalized.
        // Note: processed is also unreliable because it requires non-vote transactions to occur after this subscription opens,
        // while confirmed can produce notifications for previously sent transactions that are confirmed in this subscription window.
        (['confirmed'] as Commitment[]).forEach(commitment => {
            describe(`with filter ${JSON.stringify(filter)} and commitment ${JSON.stringify(commitment)}`, () => {
                it('produces logs notifications', async () => {
                    expect.assertions(1);
                    const logsNotifications = await rpc
                        .logsNotifications(filter, { commitment })
                        .subscribe({ abortSignal: new AbortController().signal });
                    const iterator = logsNotifications[Symbol.asyncIterator]();
                    await expect(iterator.next()).resolves.toHaveProperty(
                        'value',
                        expect.objectContaining({
                            context: {
                                slot: expect.any(BigInt),
                            },
                            value: {
                                err: null,
                                logs: expect.arrayContaining([expect.any(String)]),
                                signature: expect.any(String),
                            },
                        })
                    );
                });
            });
        });
    });
    describe('for a failed transaction', () => {
        // TODO: Reproduce a failed transaction.
        // In this case, the logs would be null, and the `err` field would have an object
        it.todo('produces an error object and null logs');
    });
});
