import {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

type GraphQLCompliantRpc = Rpc<
    GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
>;

describe('account', () => {
    let rpc: GraphQLCompliantRpc;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
        };
        it("can query an account's lamports balance", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        lamports
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        lamports: 10290815n,
                    },
                },
            });
        });
        it("can query an account's executable value", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        executable
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                    },
                },
            });
        });
        it("can query an account's address", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        address
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                    },
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        executable
                        lamports
                        rentEpoch
                        space
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        executable: false,
                        lamports: 10290815n,
                        rentEpoch: 0n,
                        space: 165n,
                    },
                },
            });
        });
    });
    describe('nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'CONFIRMED',
        };
        it("can perform a nested query for the account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        ownerProgram {
                            address
                            executable
                            lamports
                            rentEpoch
                            space
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            executable: true,
                            lamports: expect.any(BigInt),
                            rentEpoch: expect.any(BigInt),
                            space: 133352n,
                        },
                    },
                },
            });
        });
    });
    describe('double nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'CONFIRMED',
        };
        it("can perform a double nested query for each account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $commitment: Commitment) {
                    account(address: $address, commitment: $commitment) {
                        ownerProgram {
                            address
                            ownerProgram {
                                address
                                executable
                                lamports
                                rentEpoch
                                space
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            ownerProgram: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                executable: true,
                                lamports: expect.any(BigInt),
                                rentEpoch: expect.any(BigInt),
                                space: 25n,
                            },
                        },
                    },
                },
            });
        });
    });
    describe('triple nested basic queries', () => {
        // See scripts/fixtures/spl-token-token-account.json
        const variableValues = {
            address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            commitment: 'CONFIRMED',
        };
        it("can perform a triple nested query for each account's ownerProgram", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        ownerProgram {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    address
                                }
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            ownerProgram: {
                                address: 'BPFLoader2111111111111111111111111111111111',
                                ownerProgram: {
                                    address: 'NativeLoader1111111111111111111111111111111',
                                },
                            },
                        },
                    },
                },
            });
        });
    });
    describe('account data queries', () => {
        // See scripts/fixtures/gpa1.json
        const address = 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk';
        it('can get account data as base58', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        data(encoding: BASE_58)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { address });
            expect(result).toMatchObject({
                data: {
                    account: {
                        address,
                        data: '2Uw1bpnsXxu3e',
                    },
                },
            });
        });
        it('can get account data as base58 with data slice', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_58',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $encoding: AccountEncoding!) {
                    account(address: $address) {
                        address
                        data(encoding: $encoding, dataSlice: { offset: 0, length: 5 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: 'E8f4pET', // As tested on local RPC
                    },
                },
            });
        });
        it('can get account data as base64', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        data(encoding: BASE_64)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { address });
            expect(result).toMatchObject({
                data: {
                    account: {
                        address,
                        data: 'dGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data as base64 with data slice', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $encoding: AccountEncoding!) {
                    account(address: $address) {
                        address
                        data(encoding: $encoding, dataSlice: { offset: 0, length: 5 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: 'dGVzdCA=',
                    },
                },
            });
        });
        it('can get account data as base64 with two data slices', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $encoding: AccountEncoding!) {
                    account(address: $address) {
                        address
                        dataA: data(encoding: $encoding, dataSlice: { offset: 2, length: 5 })
                        dataB: data(encoding: $encoding, dataSlice: { offset: 4, length: 5 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        dataA: 'c3QgZGE=', // As tested on local RPC
                        dataB: 'IGRhdGE=', // As tested on local RPC
                    },
                },
            });
        });
        it('can get account data as base64+zstd', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        data(encoding: BASE_64_ZSTD)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { address });
            expect(result).toMatchObject({
                data: {
                    account: {
                        address,
                        data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data as base64+zstd with data slice', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64_ZSTD',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $encoding: AccountEncoding!) {
                    account(address: $address) {
                        address
                        data(encoding: $encoding, dataSlice: { offset: 0, length: 15 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        data: 'KLUv/QBYSQAAdGVzdCBkYXRh', // As tested on local RPC
                    },
                },
            });
        });
        it('can get account data as base64+zstd with multiple data slices', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                encoding: 'BASE_64_ZSTD',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!, $encoding: AccountEncoding!) {
                    account(address: $address) {
                        address
                        dataA: data(encoding: $encoding, dataSlice: { offset: 0, length: 5 })
                        dataB: data(encoding: $encoding, dataSlice: { offset: 0, length: 15 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        dataA: 'KLUv/QBYKQAAdGVzdCA=', // As tested on local RPC
                        dataB: 'KLUv/QBYSQAAdGVzdCBkYXRh', // As tested on local RPC
                    },
                },
            });
        });
        it('can get account data with multiple encodings', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        dataBase58: data(encoding: BASE_58)
                        dataBase64: data(encoding: BASE_64)
                        dataBase64Zstd: data(encoding: BASE_64_ZSTD)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { address });
            expect(result).toMatchObject({
                data: {
                    account: {
                        address,
                        dataBase58: '2Uw1bpnsXxu3e',
                        dataBase64: 'dGVzdCBkYXRh',
                        dataBase64Zstd: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                    },
                },
            });
        });
        it('can get account data with multiple encodings and data slices', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            const variableValues = {
                address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        dataBase58: data(encoding: BASE_58, dataSlice: { offset: 0, length: 5 })
                        dataBase64: data(encoding: BASE_64, dataSlice: { offset: 0, length: 5 })
                        dataBase64Zstd: data(encoding: BASE_64_ZSTD, dataSlice: { offset: 0, length: 5 })
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        dataBase58: 'E8f4pET', // As tested on local RPC
                        dataBase64: 'dGVzdCA=', // As tested on local RPC
                        dataBase64Zstd: 'KLUv/QBYKQAAdGVzdCA=', // As tested on local RPC
                    },
                },
            });
        });
        it('can get account data as jsonParsed', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        ... on MintAccount {
                            supply
                        }
                    }
                }
            `;
            const resultParsed = await rpcGraphQL.query(source, {
                // See scripts/fixtures/spl-token-mint-account.json
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            });
            expect(resultParsed).toMatchObject({
                data: {
                    account: {
                        supply: expect.any(BigInt),
                    },
                },
            });
        });
    });
    describe('specific account type queries', () => {
        it('can get a nonce account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/nonce-account.json
            const variableValues = {
                address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on NonceAccount {
                            authority {
                                address
                            }
                            blockhash
                            feeCalculator {
                                lamportsPerSignature
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                        authority: {
                            address: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                        },
                        blockhash: expect.any(String),
                        feeCalculator: {
                            lamportsPerSignature: expect.any(BigInt),
                        },
                        lamports: expect.any(BigInt),
                        ownerProgram: {
                            address: '11111111111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 80n,
                    },
                },
            });
        });
        it('can get an address lookup table account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/address-lookup-table-account.json
            const variableValues = {
                address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on LookupTableAccount {
                            addresses
                            authority {
                                address
                            }
                            deactivationSlot
                            lastExtendedSlot
                            lastExtendedSlotStartIndex
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                        addresses: expect.any(Array),
                        authority: {
                            address: '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B',
                        },
                        deactivationSlot: expect.any(BigInt),
                        lamports: expect.any(BigInt),
                        lastExtendedSlot: expect.any(BigInt),
                        lastExtendedSlotStartIndex: expect.any(Number),
                        ownerProgram: {
                            address: 'AddressLookupTab1e1111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 1304n,
                    },
                },
            });
        });
        it('can get a mint account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-mint-account.json
            const variableValues = {
                address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on MintAccount {
                            decimals
                            isInitialized
                            mintAuthority {
                                address
                                lamports
                            }
                            supply
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                        decimals: 6,
                        isInitialized: true,
                        lamports: expect.any(BigInt),
                        mintAuthority: {
                            address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            lamports: expect.any(BigInt),
                        },
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 82n,
                        supply: expect.any(BigInt),
                    },
                },
            });
        });
        it('can get a token account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/spl-token-token-account.json
            const variableValues = {
                address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on TokenAccount {
                            isNative
                            mint {
                                address
                            }
                            owner {
                                address
                            }
                            state
                            tokenAmount {
                                amount
                                decimals
                                uiAmount
                                uiAmountString
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                        isNative: expect.any(Boolean),
                        lamports: expect.any(BigInt),
                        mint: {
                            address: expect.any(String),
                        },
                        owner: {
                            address: '6UsGbaMgchgj4wiwKKuE1v5URHdcDfEiMSM25QpesKir',
                        },
                        ownerProgram: {
                            address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 165n,
                        state: expect.any(String),
                        tokenAmount: {
                            amount: expect.any(BigInt),
                            decimals: expect.any(Number),
                            uiAmountString: expect.any(String),
                        },
                    },
                },
            });
        });
        it('can get a stake account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/stake-account.json
            const variableValues = {
                address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on StakeAccount {
                            meta {
                                authorized {
                                    staker {
                                        address
                                    }
                                    withdrawer {
                                        address
                                    }
                                }
                                lockup {
                                    custodian {
                                        address
                                    }
                                    epoch
                                    unixTimestamp
                                }
                                rentExemptReserve
                            }
                            stake {
                                creditsObserved
                                delegation {
                                    activationEpoch
                                    deactivationEpoch
                                    stake
                                    voter {
                                        address
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
                    account: {
                        address: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                        lamports: expect.any(BigInt),
                        meta: {
                            authorized: {
                                staker: {
                                    address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                },
                                withdrawer: {
                                    address: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                },
                            },
                            lockup: {
                                custodian: {
                                    address: '11111111111111111111111111111111',
                                },
                                epoch: expect.any(BigInt),
                                unixTimestamp: expect.any(BigInt),
                            },
                            rentExemptReserve: expect.any(BigInt),
                        },
                        ownerProgram: {
                            address: 'Stake11111111111111111111111111111111111111',
                        },
                        rentEpoch: expect.any(BigInt),
                        space: 200n,
                        stake: {
                            creditsObserved: expect.any(BigInt),
                            delegation: {
                                activationEpoch: expect.any(BigInt),
                                deactivationEpoch: expect.any(BigInt),
                                stake: expect.any(BigInt),
                                voter: {
                                    address: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu',
                                },
                            },
                        },
                    },
                },
            });
        });
        it('can get a vote account', async () => {
            expect.assertions(1);
            // See scripts/fixtures/vote-account.json
            const variableValues = {
                address: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
            };
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        rentEpoch
                        space
                        ... on VoteAccount {
                            authorizedVoters {
                                authorizedVoter {
                                    address
                                }
                                epoch
                            }
                            authorizedWithdrawer {
                                address
                            }
                            commission
                            epochCredits {
                                credits
                                epoch
                                previousCredits
                            }
                            lastTimestamp {
                                slot
                                timestamp
                            }
                            node {
                                address
                            }
                            priorVoters
                            rootSlot
                            votes {
                                confirmationCount
                                slot
                            }
                        }
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    account: {
                        address: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                        authorizedVoters: expect.arrayContaining([
                            {
                                authorizedVoter: {
                                    address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                },
                                epoch: expect.any(BigInt),
                            },
                        ]),
                        authorizedWithdrawer: {
                            address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                        },
                        commission: expect.any(Number),
                        epochCredits: expect.arrayContaining([
                            {
                                credits: expect.any(BigInt),
                                epoch: expect.any(BigInt),
                                previousCredits: expect.any(BigInt),
                            },
                        ]),
                        lamports: expect.any(BigInt),
                        lastTimestamp: {
                            slot: expect.any(BigInt),
                            timestamp: expect.any(BigInt),
                        },
                        node: {
                            address: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                        },
                        ownerProgram: {
                            address: 'Vote111111111111111111111111111111111111111',
                        },
                        priorVoters: expect.any(Array),
                        rentEpoch: expect.any(BigInt),
                        rootSlot: expect.any(BigInt),
                        space: 3762n,
                        votes: expect.arrayContaining([
                            {
                                confirmationCount: expect.any(Number),
                                slot: expect.any(BigInt),
                            },
                        ]),
                    },
                },
            });
        });
        describe('sysvars', () => {
            it('can get the clock sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarC1ock11111111111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarClockAccount {
                                epoch
                                epochStartTimestamp
                                leaderScheduleEpoch
                                slot
                                unixTimestamp
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarC1ock11111111111111111111111111111111',
                            epoch: expect.any(BigInt),
                            epochStartTimestamp: expect.any(BigInt),
                            lamports: expect.any(BigInt),
                            leaderScheduleEpoch: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            slot: expect.any(BigInt),
                            space: expect.any(BigInt),
                            unixTimestamp: expect.any(BigInt),
                        },
                    },
                });
            });
            // TODO: Does not exist on-chain yet.
            it.todo('can get the epoch rewards sysvar');
            it('can get the epoch schedule sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarEpochSchedu1e111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarEpochScheduleAccount {
                                firstNormalEpoch
                                firstNormalSlot
                                leaderScheduleSlotOffset
                                slotsPerEpoch
                                warmup
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarEpochSchedu1e111111111111111111111111',
                            firstNormalEpoch: expect.any(BigInt),
                            firstNormalSlot: expect.any(BigInt),
                            lamports: expect.any(BigInt),
                            leaderScheduleSlotOffset: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            slotsPerEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                            warmup: expect.any(Boolean),
                        },
                    },
                });
            });
            it('can get the fees sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarFees111111111111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarFeesAccount {
                                feeCalculator {
                                    lamportsPerSignature
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarFees111111111111111111111111111111111',
                            feeCalculator: {
                                lamportsPerSignature: expect.any(BigInt),
                            },
                            lamports: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the last restart slot sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarLastRestartS1ot1111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarLastRestartSlotAccount {
                                lastRestartSlot
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarLastRestartS1ot1111111111111111111111',
                            lamports: expect.any(BigInt),
                            lastRestartSlot: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the recent blockhashes sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarRecentB1ockHashes11111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarRecentBlockhashesAccount {
                                entries {
                                    blockhash
                                    feeCalculator {
                                        lamportsPerSignature
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarRecentB1ockHashes11111111111111111111',
                            entries: expect.arrayContaining([
                                {
                                    blockhash: expect.any(String),
                                    feeCalculator: {
                                        lamportsPerSignature: expect.any(BigInt),
                                    },
                                },
                            ]),
                            lamports: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the rent sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarRent111111111111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarRentAccount {
                                burnPercent
                                exemptionThreshold
                                lamportsPerByteYear
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarRent111111111111111111111111111111111',
                            burnPercent: expect.any(Number),
                            exemptionThreshold: expect.any(Number),
                            lamports: expect.any(BigInt),
                            lamportsPerByteYear: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the slot hashes sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarS1otHashes111111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarSlotHashesAccount {
                                entries {
                                    hash
                                    slot
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarS1otHashes111111111111111111111111111',
                            entries: expect.arrayContaining([
                                {
                                    hash: expect.any(String),
                                    slot: expect.any(BigInt),
                                },
                            ]),
                            lamports: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the slot history sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarS1otHistory11111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarSlotHistoryAccount {
                                bits
                                nextSlot
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarS1otHistory11111111111111111111111111',
                            bits: expect.any(String),
                            lamports: expect.any(BigInt),
                            nextSlot: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
            it('can get the stake history sysvar', async () => {
                expect.assertions(1);
                const variableValues = {
                    address: 'SysvarStakeHistory1111111111111111111111111',
                };
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            address
                            lamports
                            ownerProgram {
                                address
                            }
                            rentEpoch
                            space
                            ... on SysvarStakeHistoryAccount {
                                entries {
                                    effective
                                    activating
                                    deactivating
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        account: {
                            address: 'SysvarStakeHistory1111111111111111111111111',
                            entries: expect.any(Array), // Not always populated on test validator
                            lamports: expect.any(BigInt),
                            ownerProgram: {
                                address: 'Sysvar1111111111111111111111111111111111111',
                            },
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        },
                    },
                });
            });
        });
        describe('token-2022 extensions', () => {
            // See scripts/fixtures/spl-token-22-mint-mega-token.json
            const megaMintAddress = '5gSwsLGzyCwgwPJSnxjsQCaFeE19ZFaibHMLky9TDFim';
            // See scripts/fixtures/spl-token-22-mint-mega-token-member.json
            const megaMemberAddress = 'CXZDzjSrQ5jPaBgk6ckTQrLPTnUURiY2GnAgVCS9Fggz';
            // See scripts/fixtures/spl-token-22-account-mega-token-member.json
            const megaAccountAddress = 'aUg6iJ3p43hTJsxHrQ1KfqMQYStoFvqcSJRcc51cYzK';
            it('mint-close-authority', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionMintCloseAuthority {
                                        closeAuthority {
                                            address
                                        }
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    closeAuthority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'mintCloseAuthority',
                                },
                            ]),
                        },
                    },
                });
            });
            it('permanent-delegate', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionPermanentDelegate {
                                        delegate {
                                            address
                                        }
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    delegate: {
                                        address: expect.any(String),
                                    },
                                    extension: 'permanentDelegate',
                                },
                            ]),
                        },
                    },
                });
            });
            it('interest-bearing-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionInterestBearingConfig {
                                        currentRate
                                        extension
                                        initializationTimestamp
                                        lastUpdateTimestamp
                                        preUpdateAverageRate
                                        rateAuthority {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    currentRate: expect.any(Number),
                                    extension: 'interestBearingConfig',
                                    initializationTimestamp: expect.any(BigInt),
                                    lastUpdateTimestamp: expect.any(BigInt),
                                    preUpdateAverageRate: expect.any(Number),
                                    rateAuthority: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('non-transferable', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionNonTransferable {
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'nonTransferable',
                                },
                            ]),
                        },
                    },
                });
            });
            it('default-account-state', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionDefaultAccountState {
                                        accountState
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    accountState: expect.any(String),
                                    extension: 'defaultAccountState',
                                },
                            ]),
                        },
                    },
                });
            });
            it('transfer-fee-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionTransferFeeConfig {
                                        extension
                                        newerTransferFee {
                                            epoch
                                            maximumFee
                                            transferFeeBasisPoints
                                        }
                                        olderTransferFee {
                                            epoch
                                            maximumFee
                                            transferFeeBasisPoints
                                        }
                                        transferFeeConfigAuthority {
                                            address
                                        }
                                        withdrawWithheldAuthority {
                                            address
                                        }
                                        withheldAmount
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'transferFeeConfig',
                                    newerTransferFee: {
                                        epoch: expect.any(BigInt),
                                        maximumFee: expect.any(BigInt),
                                        transferFeeBasisPoints: expect.any(Number),
                                    },
                                    olderTransferFee: {
                                        epoch: expect.any(BigInt),
                                        maximumFee: expect.any(BigInt),
                                        transferFeeBasisPoints: expect.any(Number),
                                    },
                                    transferFeeConfigAuthority: {
                                        address: expect.any(String),
                                    },
                                    withdrawWithheldAuthority: {
                                        address: expect.any(String),
                                    },
                                    withheldAmount: expect.any(BigInt),
                                },
                            ]),
                        },
                    },
                });
            });
            it('confidential-transfer-mint', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionConfidentialTransferMint {
                                        auditorElgamalPubkey
                                        authority {
                                            address
                                        }
                                        autoApproveNewAccounts
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    auditorElgamalPubkey: null,
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    autoApproveNewAccounts: expect.any(Boolean),
                                    extension: 'confidentialTransferMint',
                                },
                            ]),
                        },
                    },
                });
            });
            it('confidential-transfer-fee-config', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionConfidentialTransferFeeConfig {
                                        authority {
                                            address
                                        }
                                        extension
                                        harvestToMintEnabled
                                        withdrawWithheldAuthorityElgamalPubkey
                                        withheldAmount
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'confidentialTransferFeeConfig',
                                    harvestToMintEnabled: expect.any(Boolean),
                                    withdrawWithheldAuthorityElgamalPubkey: expect.any(String),
                                    withheldAmount: expect.any(String),
                                },
                            ]),
                        },
                    },
                });
            });
            it('transfer-hook', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionTransferHook {
                                        authority {
                                            address
                                        }
                                        extension
                                        hookProgramId {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'transferHook',
                                    hookProgramId: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('metadata-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionMetadataPointer {
                                        authority {
                                            address
                                        }
                                        extension
                                        metadataAddress {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'metadataPointer',
                                    metadataAddress: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('group-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionGroupPointer {
                                        authority {
                                            address
                                        }
                                        extension
                                        groupAddress {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'groupPointer',
                                    groupAddress: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('group-member-pointer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionGroupMemberPointer {
                                        authority {
                                            address
                                        }
                                        extension
                                        memberAddress {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    authority: {
                                        address: expect.any(String),
                                    },
                                    extension: 'groupMemberPointer',
                                    memberAddress: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('token-metadata', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionTokenMetadata {
                                        additionalMetadata {
                                            key
                                            value
                                        }
                                        extension
                                        mint {
                                            address
                                        }
                                        name
                                        symbol
                                        updateAuthority {
                                            address
                                        }
                                        uri
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    additionalMetadata: expect.arrayContaining([
                                        {
                                            key: expect.any(String),
                                            value: expect.any(String),
                                        },
                                    ]),
                                    extension: 'tokenMetadata',
                                    mint: {
                                        address: expect.any(String),
                                    },
                                    name: expect.any(String),
                                    symbol: expect.any(String),
                                    updateAuthority: {
                                        address: expect.any(String),
                                    },
                                    uri: expect.any(String),
                                },
                            ]),
                        },
                    },
                });
            });
            it('token-group', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionTokenGroup {
                                        extension
                                        maxSize
                                        mint {
                                            address
                                        }
                                        size
                                        updateAuthority {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMintAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'tokenGroup',
                                    maxSize: expect.any(BigInt),
                                    mint: {
                                        address: expect.any(String),
                                    },
                                    size: expect.any(BigInt),
                                    updateAuthority: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });
            it('token-group-member', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on MintAccount {
                                extensions {
                                    ... on SplTokenExtensionTokenGroupMember {
                                        extension
                                        group {
                                            address
                                        }
                                        memberNumber
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, { address: megaMemberAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'tokenGroupMember',
                                    group: {
                                        address: expect.any(String),
                                    },
                                    memberNumber: expect.any(BigInt),
                                    mint: {
                                        address: expect.any(String),
                                    },
                                },
                            ]),
                        },
                    },
                });
            });

            it('confidential-transfer-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionConfidentialTransferAccount {
                                        actualPendingBalanceCreditCounter
                                        allowConfidentialCredits
                                        allowNonConfidentialCredits
                                        approved
                                        availableBalance
                                        decryptableAvailableBalance
                                        elgamalPubkey
                                        expectedPendingBalanceCreditCounter
                                        maximumPendingBalanceCreditCounter
                                        pendingBalanceCreditCounter
                                        pendingBalanceHi
                                        pendingBalanceLo
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    actualPendingBalanceCreditCounter: null,
                                    allowConfidentialCredits: expect.any(Boolean),
                                    allowNonConfidentialCredits: expect.any(Boolean),
                                    approved: expect.any(Boolean),
                                    availableBalance: expect.any(String),
                                    decryptableAvailableBalance: expect.any(String),
                                    elgamalPubkey: expect.any(String),
                                    expectedPendingBalanceCreditCounter: null,
                                    extension: 'confidentialTransferAccount',
                                    maximumPendingBalanceCreditCounter: null,
                                    pendingBalanceCreditCounter: null,
                                    pendingBalanceHi: expect.any(String),
                                    pendingBalanceLo: expect.any(String),
                                },
                            ]),
                        },
                    },
                });
            });

            it('transfer-fee-amount', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionTransferFeeAmount {
                                        extension
                                        withheldAmount
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'transferFeeAmount',
                                    withheldAmount: expect.any(BigInt),
                                },
                            ]),
                        },
                    },
                });
            });

            it('transfer-hook-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionTransferHookAccount {
                                        extension
                                        transferring
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'transferHookAccount',
                                    transferring: expect.any(Boolean),
                                },
                            ]),
                        },
                    },
                });
            });

            it('confidential-transfer-fee-amount', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionConfidentialTransferFeeAmount {
                                        extension
                                        withheldAmount
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'confidentialTransferFeeAmount',
                                    withheldAmount: expect.any(String),
                                },
                            ]),
                        },
                    },
                });
            });

            it('non-transferable-account', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionNonTransferableAccount {
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'nonTransferableAccount',
                                },
                            ]),
                        },
                    },
                });
            });

            it('immutable-owner', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionImmutableOwner {
                                        extension
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'immutableOwner',
                                },
                            ]),
                        },
                    },
                });
            });

            it('memo-transfer', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionMemoTransfer {
                                        extension
                                        requireIncomingTransferMemos
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'memoTransfer',
                                    requireIncomingTransferMemos: expect.any(Boolean),
                                },
                            ]),
                        },
                    },
                });
            });

            it('cpi-guard', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        account(address: $address) {
                            ... on TokenAccount {
                                extensions {
                                    ... on SplTokenExtensionCpiGuard {
                                        extension
                                        lockCpi
                                    }
                                }
                            }
                        }
                    }
                `;

                const result = await rpcGraphQL.query(source, { address: megaAccountAddress });
                expect(result).toMatchObject({
                    data: {
                        account: {
                            extensions: expect.arrayContaining([
                                {
                                    extension: 'cpiGuard',
                                    lockCpi: expect.any(Boolean),
                                },
                            ]),
                        },
                    },
                });
            });
        });
    });
});
