import { Base58EncodedAddress } from '@solana/keys';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getAccountInfo', () => {
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
            it('returns account info', async () => {
                expect.assertions(1);
                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                const publicKey =
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        commitment,
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toMatchObject({
                    value: expect.objectContaining({
                        data: expect.any(String),
                        executable: expect.any(Boolean),
                        lamports: expect.any(BigInt),
                        owner: expect.any(String),
                        rentEpoch: expect.any(BigInt),
                        space: expect.any(BigInt),
                    }),
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;
            const sendPromise = rpc
                .getAccountInfo(publicKey, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with base58 encoding', () => {
        it('returns account info with annotated base58 encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base58',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
        });
    });

    describe('when called with base64 encoding', () => {
        it('returns account info with annotated base64 encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
        });
    });

    describe('when called with base64+zstd encoding', () => {
        it('returns account info with annotated base64+zstd encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base64+zstd',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
        });
    });

    describe('when called with jsonParsed encoding', () => {
        describe('for an account without parse-able JSON data', () => {
            it('falls back to annotated base64', async () => {
                expect.assertions(1);
                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                const publicKey =
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

                const accountInfo = await rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });

        describe('for an account with parse-able JSON data', () => {
            it('returns parsed JSON data', async () => {
                expect.assertions(1);
                //See scripts/fixtures/CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN.json
                // This is a base64 encoded stake account
                const publicKey =
                    'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN' as Base58EncodedAddress<'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN'>;

                const accountInfo = await rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo).toMatchObject({
                    value: expect.objectContaining({
                        data: expect.objectContaining({
                            parsed: expect.objectContaining({
                                info: {
                                    meta: expect.any(Object),
                                    stake: expect.any(Object),
                                },
                                type: 'delegated',
                            }),
                            program: 'stake',
                            space: expect.any(BigInt),
                        }),
                    }),
                });
            });
        });
    });

    describe('when called with no encoding', () => {
        it('returns base58 data without an annotation', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc.getAccountInfo(publicKey, {}).send();

            expect(accountInfo.value?.data).toBe('2Uw1bpnsXxu3e');
        });
    });

    describe('when called with a dataSlice', () => {
        it('returns the correct slice of the data', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['dGVzdCA=', 'base64']);
        });
    });
});
