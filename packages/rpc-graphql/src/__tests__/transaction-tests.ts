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
    mockTransactionToken2022AllExtensions,
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
                                                amount: expect.any(BigInt),
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
        describe('token-2022 extensions', () => {
            beforeEach(() => {
                mockRpcTransport.mockResolvedValueOnce(mockTransactionToken2022AllExtensions);
            });
            it('initialize-mint-close-authority', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeMintCloseAuthorityInstruction {
                                        mint {
                                            address
                                        }
                                        newAuthority {
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
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        newAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-permanent-delegate', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializePermanentDelegateInstruction {
                                        delegate {
                                            address
                                        }
                                        mint {
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
                                        delegate: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-group-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeGroupPointerInstruction {
                                        authority {
                                            address
                                        }
                                        groupAddress {
                                            address
                                        }
                                        mint {
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        groupAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('update-group-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateGroupPointerInstruction {
                                        authority {
                                            address
                                        }
                                        groupAddress {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigAuthority {
                                            address
                                        }
                                        signers
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        groupAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        authority: null,
                                        groupAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-group-member-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeGroupMemberPointerInstruction {
                                        authority {
                                            address
                                        }
                                        memberAddress {
                                            address
                                        }
                                        mint {
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        memberAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('update-group-member-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateGroupMemberPointerInstruction {
                                        authority {
                                            address
                                        }
                                        memberAddress {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigAuthority {
                                            address
                                        }
                                        signers
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        memberAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        authority: null,
                                        memberAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-metadata-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeMetadataPointerInstruction {
                                        authority {
                                            address
                                        }
                                        metadataAddress {
                                            address
                                        }
                                        mint {
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        metadataAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('update-metadata-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateMetadataPointerInstruction {
                                        authority {
                                            address
                                        }
                                        metadataAddress {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigAuthority {
                                            address
                                        }
                                        signers
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        metadataAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        authority: null,
                                        metadataAddress: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-transferFee-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeTransferFeeConfig {
                                        mint {
                                            address
                                        }
                                        transferFeeBasisPoints
                                        maximumFee
                                        transferFeeConfigAuthority {
                                            address
                                        }
                                        withdrawWithheldAuthority {
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
                                        maximumFee: expect.any(Number),
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        transferFeeBasisPoints: expect.any(Number),
                                        transferFeeConfigAuthority: {
                                            address: expect.any(String),
                                        },
                                        withdrawWithheldAuthority: {
                                            address: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-transfer-hook', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeTransferHookInstruction {
                                        authority {
                                            address
                                        }
                                        hookProgramId {
                                            address
                                        }
                                        mint {
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        hookProgramId: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('update-transfer-hook', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateTransferHookInstruction {
                                        authority {
                                            address
                                        }
                                        hookProgramId {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigAuthority {
                                            address
                                        }
                                        signers
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        hookProgramId: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        authority: null,
                                        hookProgramId: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('initialize-default-account-state', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeDefaultAccountStateInstruction {
                                        accountState
                                        mint {
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
                                        accountState: expect.any(String),
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('update-default-account-state', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateDefaultAccountStateInstruction {
                                        accountState
                                        freezeAuthority {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigFreezeAuthority {
                                            address
                                        }
                                        signers
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
                                        accountState: expect.any(String),
                                        freezeAuthority: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigFreezeAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        accountState: expect.any(String),
                                        freezeAuthority: null,
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigFreezeAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('enable-cpi-guard', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenEnableCpiGuardInstruction {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });
            it('disable-cpi-guard', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenDisableCpiGuardInstruction {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('harvest-withheld-tokens-to-mint', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenHarvestWithheldTokensToMint {
                                        mint {
                                            address
                                        }
                                        sourceAccounts
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
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        sourceAccounts: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('withdraw-withheld-tokens-from-accounts', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenWithdrawWithheldTokensFromAccounts {
                                        feeRecipient {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigWithdrawWithheldAuthority {
                                            address
                                        }
                                        signers
                                        sourceAccounts
                                        withdrawWithheldAuthority {
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
                                        feeRecipient: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigWithdrawWithheldAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                        sourceAccounts: expect.arrayContaining([expect.any(String)]),
                                        withdrawWithheldAuthority: {
                                            address: expect.any(String),
                                        },
                                    },
                                    {
                                        feeRecipient: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigWithdrawWithheldAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                        sourceAccounts: expect.arrayContaining([expect.any(String)]),
                                        withdrawWithheldAuthority: null,
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('withdraw-withheld-tokens-from-mint', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenWithdrawWithheldTokensFromMint {
                                        mint {
                                            address
                                        }
                                        feeRecipient {
                                            address
                                        }
                                        withdrawWithheldAuthority {
                                            address
                                        }
                                        multisigWithdrawWithheldAuthority {
                                            address
                                        }
                                        signers
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
                                        feeRecipient: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigWithdrawWithheldAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                        withdrawWithheldAuthority: {
                                            address: expect.any(String),
                                        },
                                    },
                                    {
                                        feeRecipient: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigWithdrawWithheldAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                        withdrawWithheldAuthority: null,
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('transfer-checked-with-fee', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenTransferCheckedWithFee {
                                        mint {
                                            address
                                        }
                                        authority {
                                            address
                                        }
                                        source {
                                            address
                                        }
                                        destination {
                                            address
                                        }
                                        feeAmount {
                                            amount
                                            decimals
                                            uiAmount
                                            uiAmountString
                                        }
                                        tokenAmount {
                                            amount
                                            decimals
                                            uiAmount
                                            uiAmountString
                                        }
                                        multisigAuthority {
                                            address
                                        }
                                        signers
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
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        feeAmount: {
                                            amount: expect.any(BigInt),
                                            decimals: expect.any(Number),
                                            uiAmount: null, // can't convert decimal to BigInt
                                            uiAmountString: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                        source: {
                                            address: expect.any(String),
                                        },
                                        tokenAmount: {
                                            amount: expect.any(BigInt),
                                            decimals: expect.any(Number),
                                            uiAmount: expect.any(BigInt),
                                            uiAmountString: expect.any(String),
                                        },
                                    },
                                    {
                                        authority: null,
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        feeAmount: {
                                            amount: expect.any(BigInt),
                                            decimals: expect.any(Number),
                                            uiAmount: null, // can't convert decimal to BigInt
                                            uiAmountString: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigAuthority: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                        source: {
                                            address: expect.any(String),
                                        },
                                        tokenAmount: {
                                            amount: expect.any(BigInt),
                                            decimals: expect.any(Number),
                                            uiAmount: null, // Can't convert decimal to BigInt
                                            uiAmountString: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('enable-required-memo-transfers', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenEnableRequiredMemoTransfers {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('disable-required-memo-transfers', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenDisableRequiredMemoTransfers {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('initialize-confidential-transfer-mint', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeConfidentialTransferMint {
                                        mint {
                                            address
                                        }
                                        authority {
                                            address
                                        }
                                        auditorElgamalPubkey
                                        autoApproveNewAccounts
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
                                        auditorElgamalPubkey: null,
                                        authority: {
                                            address: expect.any(String),
                                        },
                                        autoApproveNewAccounts: expect.any(Boolean),
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('initialize-interest-bearing-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenInitializeInterestBearingConfig {
                                        mint {
                                            address
                                        }
                                        rate
                                        rateAuthority {
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
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        rate: expect.any(Number),
                                        rateAuthority: {
                                            address: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('update-interest-bearing-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenUpdateInterestBearingConfigRate {
                                        mint {
                                            address
                                        }
                                        multisigRateAuthority {
                                            address
                                        }
                                        newRate
                                        rateAuthority {
                                            address
                                        }
                                        signers
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
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigRateAuthority: null,
                                        newRate: expect.any(Number),
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        rateAuthority: {
                                            address: expect.any(String),
                                        },
                                        signers: null,
                                    },
                                    {
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigRateAuthority: {
                                            address: expect.any(String),
                                        },
                                        newRate: expect.any(Number),
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        rateAuthority: null,
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('approve-confidential-transfer-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenApproveConfidentialTransferAccount {
                                        account {
                                            address
                                        }
                                        confidentialTransferAuditorAuthority {
                                            address
                                        }
                                        mint {
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        confidentialTransferAuditorAuthority: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('empty-confidential-transfer-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenEmptyConfidentialTransferAccount {
                                        account {
                                            address
                                        }
                                        instructionsSysvar {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        proofInstructionOffset
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        instructionsSysvar: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        proofInstructionOffset: expect.any(Number),
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        instructionsSysvar: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        proofInstructionOffset: expect.any(Number),
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('configure-confidential-transfer-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenConfigureConfidentialTransferAccount {
                                        account {
                                            address
                                        }
                                        decryptableZeroBalance
                                        maximumPendingBalanceCreditCounter
                                        mint {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        decryptableZeroBalance: expect.any(String),
                                        maximumPendingBalanceCreditCounter: expect.any(BigInt),
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('apply-pending-confidential-transfer-balance', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenApplyPendingConfidentialTransferBalance {
                                        account {
                                            address
                                        }
                                        expectedPendingBalanceCreditCounter
                                        multisigOwner {
                                            address
                                        }
                                        newDecryptableAvailableBalance
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        expectedPendingBalanceCreditCounter: expect.any(BigInt),
                                        multisigOwner: null,
                                        newDecryptableAvailableBalance: expect.any(String),
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        expectedPendingBalanceCreditCounter: expect.any(BigInt),
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        newDecryptableAvailableBalance: expect.any(String),
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('enable-confidential-transfer-confidential-credits', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenEnableConfidentialTransferConfidentialCredits {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('disable-confidential-transfer-confidential-credits', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenDisableConfidentialTransferConfidentialCredits {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('enable-confidential-transfer-non-confidential-credits', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenEnableConfidentialTransferNonConfidentialCredits {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('disable-confidential-transfer-non-confidential-credits', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenDisableConfidentialTransferNonConfidentialCredits {
                                        account {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
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
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                    },
                                    {
                                        account: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('deposit-confidential-transfer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenDepositConfidentialTransfer {
                                        amount
                                        decimals
                                        destination {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        owner {
                                            address
                                        }
                                        signers
                                        source {
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
                                        amount: expect.any(BigInt),
                                        decimals: expect.any(BigInt),
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: null,
                                        source: {
                                            address: expect.any(String),
                                        },
                                    },
                                    {
                                        amount: expect.any(BigInt),
                                        decimals: expect.any(BigInt),
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        signers: expect.arrayContaining([expect.any(String)]),
                                        source: {
                                            address: expect.any(String),
                                        },
                                    },
                                ]),
                            },
                        },
                    },
                });
            });

            it('withdraw-confidential-transfer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction(signature: $signature) {
                            message {
                                instructions {
                                    programId
                                    ... on SplTokenWithdrawConfidentialTransfer {
                                        amount
                                        decimals
                                        destination {
                                            address
                                        }
                                        instructionsSysvar {
                                            address
                                        }
                                        mint {
                                            address
                                        }
                                        multisigOwner {
                                            address
                                        }
                                        newDecryptableAvailableBalance
                                        owner {
                                            address
                                        }
                                        proofInstructionOffset
                                        signers
                                        source {
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
                                        amount: expect.any(BigInt),
                                        decimals: expect.any(BigInt),
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        instructionsSysvar: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: null,
                                        newDecryptableAvailableBalance: expect.any(String),
                                        owner: {
                                            address: expect.any(String),
                                        },
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        proofInstructionOffset: expect.any(Number),
                                        signers: null,
                                        source: {
                                            address: expect.any(String),
                                        },
                                    },
                                    {
                                        amount: expect.any(BigInt),
                                        decimals: expect.any(BigInt),
                                        destination: {
                                            address: expect.any(String),
                                        },
                                        instructionsSysvar: {
                                            address: expect.any(String),
                                        },
                                        mint: {
                                            address: expect.any(String),
                                        },
                                        multisigOwner: {
                                            address: expect.any(String),
                                        },
                                        newDecryptableAvailableBalance: expect.any(String),
                                        owner: null,
                                        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                                        proofInstructionOffset: expect.any(Number),
                                        signers: expect.arrayContaining([expect.any(String)]),
                                        source: {
                                            address: expect.any(String),
                                        },
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
