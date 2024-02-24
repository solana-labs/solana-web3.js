import { Signature } from '@solana/keys';
import {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../index';
import {
    mockTransactionAddressLookup,
    mockTransactionBase58,
    mockTransactionBase64,
    mockTransactionGeneric,
    mockTransactionMemo,
    mockTransactionSystem,
    mockTransactionToken,
    mockTransactionVote,
} from './__setup__';

type GraphQLCompliantRpc = Rpc<
    GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
>;

describe('transaction', () => {
    let mockRpc: GraphQLCompliantRpc;
    let mockRpcTransport: jest.Mock;
    let rpcGraphQL: RpcGraphQL;

    // Random signature for testing.
    // Not actually used. Just needed for proper query parsing.
    const signature =
        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk' as Signature;

    beforeEach(() => {
        mockRpcTransport = jest.fn();
        mockRpc = new Proxy<GraphQLCompliantRpc>({} as GraphQLCompliantRpc, {
            get(target, p) {
                if (!target[p as keyof GraphQLCompliantRpc]) {
                    const pendingRpcRequest = { send: mockRpcTransport };
                    target[p as keyof GraphQLCompliantRpc] = jest
                        .fn()
                        .mockReturnValue(pendingRpcRequest) as GraphQLCompliantRpc[keyof GraphQLCompliantRpc];
                }
                return target[p as keyof GraphQLCompliantRpc];
            },
        });
        rpcGraphQL = createRpcGraphQL(mockRpc);
    });

    describe('basic queries', () => {
        it('can query a transaction', async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionVote);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        blockTime
                        slot
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        blockTime: expect.any(BigInt),
                        slot: expect.any(BigInt),
                    },
                },
            });
        });
        it("can query a transaction's computeUnitsConsumed from it's meta", async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionVote);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        meta {
                            computeUnitsConsumed
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
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
            mockRpcTransport.mockResolvedValueOnce(mockTransactionVote);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        meta {
                            computeUnitsConsumed
                            fee
                            logMessages
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        meta: {
                            computeUnitsConsumed: expect.any(BigInt),
                            fee: expect.any(BigInt),
                            logMessages: expect.any(Array),
                        },
                    },
                },
            });
        });
    });
    describe('transaction data queries', () => {
        it('can get a transaction as base58', async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionBase58);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        data(encoding: BASE_58)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as base64', async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionBase64);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        data(encoding: BASE_64)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        data: expect.any(String),
                    },
                },
            });
        });
        it('can get a transaction as multiple encodings', async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionBase58);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionBase64);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        dataBase58: data(encoding: BASE_58)
                        dataBase64: data(encoding: BASE_64)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        dataBase58: expect.any(String),
                        dataBase64: expect.any(String),
                    },
                },
            });
        });
        it('defaults to jsonParsed', async () => {
            expect.assertions(1);
            mockRpcTransport.mockResolvedValueOnce(mockTransactionVote);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        message {
                            accountKeys {
                                pubkey
                                signer
                                writable
                            }
                            recentBlockhash
                        }
                        signatures
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { signature });
            expect(result).toMatchObject({
                data: {
                    transaction: {
                        message: {
                            accountKeys: expect.arrayContaining([
                                {
                                    pubkey: expect.any(String),
                                    signer: expect.any(Boolean),
                                    writable: expect.any(Boolean),
                                },
                            ]),
                            recentBlockhash: expect.any(String),
                        },
                        signatures: expect.any(Array),
                    },
                },
            });
        });
    });
    describe('specific transaction instruction queries', () => {
        describe('instructions', () => {
            it('can get a generic instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionGeneric);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    ... on GenericInstruction {
                                        accounts
                                        data
                                        programId
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        accounts: expect.any(Array),
                                        data: expect.any(String),
                                        programId: expect.any(String),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `ExtendLookupTable` instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionAddressLookup);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on ExtendLookupTableInstruction {
                                        lookupTableAccount {
                                            address
                                        }
                                        lookupTableAuthority {
                                            address
                                        }
                                        newAddresses
                                        payerAccount {
                                            address
                                        }
                                        systemProgram {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        lookupTableAccount: {
                                            address: expect.any(String),
                                        },
                                        lookupTableAuthority: {
                                            address: expect.any(String),
                                        },
                                        newAddresses: expect.any(Array),
                                        payerAccount: {
                                            address: expect.any(String),
                                        },
                                        programId: 'AddressLookupTab1e1111111111111111111111111',
                                        systemProgram: {
                                            address: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `CreateAccount` instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionSystem);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on CreateAccountInstruction {
                                        lamports
                                        newAccount {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        source {
                                            address
                                        }
                                        space
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        lamports: expect.any(BigInt),
                                        newAccount: {
                                            address: expect.any(String),
                                        },
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: '11111111111111111111111111111111',
                                        source: {
                                            address: expect.any(String),
                                        },
                                        space: expect.any(BigInt),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `SplMemoInstruction` instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionMemo);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplMemoInstruction {
                                        memo
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        memo: 'fb_07ce1448',
                                        programId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `SplTokenInitializeMintInstruction` instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionToken);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        freezeAuthority {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        mintAuthority {
                                            address
                                        }
                                        rentSysvar {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            message: {
                                instructions: expect.arrayContaining([
                                    {
                                        decimals: expect.any(BigInt),
                                        freezeAuthority: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        mintAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                        rentSysvar: { address: expect.any(String) },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
        });
        describe('inner instructions', () => {
            it('can get an `Allocate` inner instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionSystem);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            meta {
                                innerInstructions {
                                    instructions {
                                        programId
                                        ... on AllocateInstruction {
                                            account {
                                                address
                                            }
                                            space
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            meta: {
                                innerInstructions: expect.arrayContaining([
                                    {
                                        instructions: expect.arrayContaining([
                                            {
                                                account: {
                                                    address: expect.any(String),
                                                },
                                                programId: '11111111111111111111111111111111',
                                                space: expect.any(BigInt),
                                            },
                                        ]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get an `Assign` inner instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionSystem);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            meta {
                                innerInstructions {
                                    instructions {
                                        programId
                                        ... on AssignInstruction {
                                            account {
                                                address
                                            }
                                            owner {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            meta: {
                                innerInstructions: expect.arrayContaining([
                                    {
                                        instructions: expect.arrayContaining([
                                            {
                                                account: {
                                                    address: expect.any(String),
                                                },
                                                owner: {
                                                    address: expect.any(String),
                                                },
                                                programId: '11111111111111111111111111111111',
                                            },
                                        ]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `Transfer` inner instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionSystem);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            meta {
                                innerInstructions {
                                    instructions {
                                        programId
                                        ... on TransferInstruction {
                                            destination {
                                                address
                                            }
                                            lamports
                                            source {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            meta: {
                                innerInstructions: expect.arrayContaining([
                                    {
                                        instructions: expect.arrayContaining([
                                            {
                                                destination: {
                                                    address: expect.any(String),
                                                },
                                                lamports: expect.any(BigInt),
                                                programId: '11111111111111111111111111111111',
                                                source: {
                                                    address: expect.any(String),
                                                },
                                            },
                                        ]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('can get a `SplTokenTransfer` inner instruction', async () => {
                expect.assertions(1);
                mockRpcTransport.mockResolvedValueOnce(mockTransactionToken);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            meta {
                                innerInstructions {
                                    instructions {
                                        programId
                                        ... on SplTokenTransferInstruction {
                                            amount
                                            destination {
                                                address
                                            }
                                            source {
                                                address
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { signature });
                expect(result).toMatchObject({
                    data: {
                        transaction: {
                            meta: {
                                innerInstructions: expect.arrayContaining([
                                    {
                                        instructions: expect.arrayContaining([
                                            {
                                                amount: expect.any(String),
                                                destination: {
                                                    address: expect.any(String),
                                                },
                                                programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                                source: {
                                                    address: expect.any(String),
                                                },
                                            },
                                        ]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
        });
    });
});
