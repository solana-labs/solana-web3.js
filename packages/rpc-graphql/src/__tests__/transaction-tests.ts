/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Base58EncodedAddress } from '@solana/addresses';
import { createSolanaRpcApi, LamportsUnsafeBeyond2Pow53Minus1, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('transaction', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;

    function initRpc() {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    }

    beforeEach(() => {
        initRpc();
    });

    // Transactions to query
    let airdropSignature: string;
    // let transferSignature: string;

    // Create some transactions so they can be queried
    beforeAll(async () => {
        initRpc();
        airdropSignature = await rpc
            .requestAirdrop(
                // Randomly generated
                '2u1vhJokpmmRzmTB4FJcJhnfkvLoBmYvLMWm764JDs4h' as Base58EncodedAddress,
                5000000n as LamportsUnsafeBeyond2Pow53Minus1,
                { commitment: 'confirmed' }
            )
            .send();
        // transferSignature = await rpc.sendTransaction(transferTx).send();
        // Sleep for 1 second to allow the transactions to be confirmed
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    describe('basic queries', () => {
        it("can query a transaction's slot", async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment) {
                    transaction(signature: $signature, commitment: $commitment) {
                        slot
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        slot: expect.any(BigInt),
                    },
                },
            });
        });
        it("can query a transaction's block time", async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment) {
                    transaction(signature: $signature, commitment: $commitment) {
                        blockTime
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        blockTime: expect.any(BigInt),
                    },
                },
            });
        });
        it("can query a transaction's computeUnitsConsumed from it's meta", async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment) {
                    transaction(signature: $signature, commitment: $commitment) {
                        meta {
                            computeUnitsConsumed
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            computeUnitsConsumed: expect.any(BigInt),
                        },
                    },
                },
            });
        });
        it("can query several fields from a transaction's meta", async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment) {
                    transaction(signature: $signature, commitment: $commitment) {
                        meta {
                            computeUnitsConsumed
                            fee
                            logMessages
                            rewards {
                                commission
                                lamports
                                postBalance
                                pubkey
                                rewardType
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            computeUnitsConsumed: expect.any(BigInt),
                            fee: expect.any(BigInt),
                            logMessages: expect.any(Array),
                            rewards: expect.any(Array),
                        },
                    },
                },
            });
        });
    });
    describe('transaction data queries', () => {
        it('can get a transaction as base58', async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
                encoding: 'base58',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment, $encoding: TransactionEncoding!) {
                    transaction(signature: $signature, commitment: $commitment, encoding: $encoding) {
                        ... on TransactionBase58 {
                            transaction
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        transaction: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as base64', async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
                encoding: 'base64',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment, $encoding: TransactionEncoding!) {
                    transaction(signature: $signature, commitment: $commitment, encoding: $encoding) {
                        ... on TransactionBase64 {
                            transaction
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        transaction: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as json', async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
                encoding: 'json',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment, $encoding: TransactionEncoding!) {
                    transaction(signature: $signature, commitment: $commitment, encoding: $encoding) {
                        ... on TransactionJson {
                            transaction {
                                message {
                                    header {
                                        numReadonlySignedAccounts
                                        numReadonlyUnsignedAccounts
                                        numRequiredSignatures
                                    }
                                }
                                signatures
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        transaction: {
                            message: {
                                header: {
                                    numReadonlySignedAccounts: expect.any(Number),
                                    numReadonlyUnsignedAccounts: expect.any(Number),
                                    numRequiredSignatures: expect.any(Number),
                                },
                            },
                            signatures: expect.any(Array),
                        },
                    },
                },
            });
        });
        it('can get a transaction as jsonParsed', async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment, $encoding: TransactionEncoding!) {
                    transaction(signature: $signature, commitment: $commitment, encoding: $encoding) {
                        ... on TransactionJsonParsed {
                            transaction {
                                message {
                                    ... on TransactionMessageParsed {
                                        accountKeys {
                                            pubkey
                                            signer
                                            source
                                            writable
                                        }
                                        instructions {
                                            ... on PartiallyDecodedInstruction {
                                                accounts
                                                data
                                                programId
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        transaction: {
                            message: {
                                accountKeys: expect.arrayContaining([
                                    {
                                        pubkey: expect.any(String),
                                        signer: expect.any(Boolean),
                                        source: expect.any(String),
                                        writable: expect.any(Boolean),
                                    },
                                ]),
                                instructions: expect.any(Array), // Inconsistent for airdrop
                            },
                        },
                    },
                },
            });
        });
        it('defaults to jsonParsed', async () => {
            expect.assertions(1);
            const variableValues = {
                signature: airdropSignature,
                commitment: 'confirmed',
            };
            const source = `
                query testQuery($signature: String!, $commitment: Commitment) {
                    transaction(signature: $signature, commitment: $commitment) {
                        ... on TransactionJsonParsed {
                            transaction {
                                message {
                                    ... on TransactionMessageParsed {
                                        accountKeys {
                                            pubkey
                                            signer
                                            source
                                            writable
                                        }
                                        instructions {
                                            ... on PartiallyDecodedInstruction {
                                                accounts
                                                data
                                                programId
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        transaction: {
                            message: {
                                accountKeys: expect.arrayContaining([
                                    {
                                        pubkey: expect.any(String),
                                        signer: expect.any(Boolean),
                                        source: expect.any(String),
                                        writable: expect.any(Boolean),
                                    },
                                ]),
                                instructions: expect.any(Array), // Inconsistent for airdrop
                            },
                        },
                    },
                },
            });
        });
    });
    describe('specific transaction instruction queries', () => {
        // TODO: Until we can replicate the proper transaction to look up
        it.todo('can get a partially decoded instruction');
        // TODO: Until we can replicate the proper transaction to look up
        it.todo('can get a specific instruction');
    });
});
