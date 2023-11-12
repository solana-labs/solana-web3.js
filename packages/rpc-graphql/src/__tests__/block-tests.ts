import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';
import {
    mockBlockAccounts,
    mockBlockFull,
    mockBlockFullBase58,
    mockBlockFullBase64,
    mockBlockNone,
    mockBlockSignatures,
    mockRpcResponse,
} from './__setup__';

describe('block', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;

    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const defaultSlot = 511226n as Slot;

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        it("can query a block's block time", async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}) {
                        blockTime
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockTime: expect.any(Number),
                    },
                },
            });
        });
        it('can query multiple fields on a block', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFull)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}) {
                        blockhash
                        parentSlot
                        rewards {
                            pubkey
                            lamports
                            postBalance
                            rewardType
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                        parentSlot: expect.any(BigInt),
                        rewards: expect.arrayContaining([
                            {
                                lamports: expect.any(BigInt),
                                postBalance: expect.any(BigInt),
                                pubkey: expect.any(String),
                                rewardType: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
    });
    describe('block with signatures transaction details', () => {
        it('can query a block with signatures transaction details', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockSignatures)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}, transactionDetails: signatures) {
                        ... on BlockWithSignatures {
                            signatures
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        signatures: expect.any(Array),
                    },
                },
            });
        });
    });
    describe('block with accounts transaction details', () => {
        it('can query a block with accounts transaction details', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockAccounts)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}, transactionDetails: accounts) {
                        ... on BlockWithAccounts {
                            transactions {
                                data {
                                    accountKeys
                                    signatures
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                data: {
                                    accountKeys: expect.any(Array),
                                    signatures: expect.any(Array),
                                },
                            },
                        ]),
                    },
                },
            });
        });
    });
    describe('block with none transaction details', () => {
        it('can query a block with none transaction details', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockNone)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}, transactionDetails: none) {
                        ... on BlockWithNone {
                            blockhash
                            rewards {
                                pubkey
                                lamports
                                postBalance
                                rewardType
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        blockhash: expect.any(String),
                        rewards: expect.arrayContaining([
                            {
                                lamports: expect.any(BigInt),
                                postBalance: expect.any(BigInt),
                                pubkey: expect.any(String),
                                rewardType: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
    });
    describe('block with full transaction details', () => {
        it('can query a block with base58 encoded transactions', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFullBase58)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}, encoding: base58) {
                        ... on BlockWithFull {
                            transactions {
                                ... on TransactionBase58 {
                                    data
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                data: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
        it('can query a block with base64 encoded transactions', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockFullBase64)));
            const source = /* GraphQL */ `
                query testQuery {
                    block(slot: ${defaultSlot}, encoding: base64) {
                        ... on BlockWithFull {
                            transactions {
                                ... on TransactionBase64 {
                                    data
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source);
            expect(result).toMatchObject({
                data: {
                    block: {
                        transactions: expect.arrayContaining([
                            {
                                data: expect.any(String),
                            },
                        ]),
                    },
                },
            });
        });
        it.todo('can query a block with transactions as JSON parsed');
        it.todo('can query a block with transactions as JSON parsed with specific instructions');
    });
    describe('cache tests', () => {
        // Not required yet since blocks are not supported as nested queries.
        it.todo('coalesces multiple requests for the same block into one');
    });
});
