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

describe('programAccounts', () => {
    let rpc: GraphQLCompliantRpc;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
        rpcGraphQL = createRpcGraphQL(rpc);
    });

    describe('basic queries', () => {
        // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
        const variableValues = {
            commitment: 'CONFIRMED',
            programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
        };
        it("can query program accounts' lamports balances", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!, $commitment: Commitment) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment) {
                        lamports
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([{ lamports: expect.any(BigInt) }]),
                },
            });
        });
        it("can query program accounts' executable value", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!, $commitment: Commitment) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment) {
                        executable
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([{ executable: expect.any(Boolean) }]),
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!, $commitment: Commitment) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment) {
                        executable
                        lamports
                        rentEpoch
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            executable: expect.any(Boolean),
                            lamports: expect.any(BigInt),
                            rentEpoch: expect.any(BigInt),
                        },
                    ]),
                },
            });
        });
    });
    describe('account data queries', () => {
        // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
        const programAddress = 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6';
        it("can get program accounts' data as base58", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        executable
                        data(encoding: BASE_58)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { programAddress });
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            address: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                            data: '2Uw1bpnsXxu3e',
                            executable: false,
                        },
                        {
                            address: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                            data: '2Uw1bpnsXxu3e',
                            executable: false,
                        },
                    ]),
                },
            });
        });
        it("can get program accounts' data as base64", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        executable
                        data(encoding: BASE_64)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { programAddress });
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            address: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                            data: 'dGVzdCBkYXRh',
                            executable: false,
                        },
                        {
                            address: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                            data: 'dGVzdCBkYXRh',
                            executable: false,
                        },
                    ]),
                },
            });
        });
        it("can get program accounts' data as base64+zstd", async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        executable
                        data(encoding: BASE_64_ZSTD)
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, { programAddress });
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            address: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                            data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                            executable: false,
                        },
                        {
                            address: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                            data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                            executable: false,
                        },
                    ]),
                },
            });
        });
    });
    describe('specific account type queries', () => {
        it('address lookup table program', async () => {
            expect.assertions(1);
            const variableValues = {
                programAddress: 'AddressLookupTab1e1111111111111111111111111',
            };
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
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
                    programAccounts: expect.arrayContaining([
                        {
                            address: expect.any(String),
                            addresses: expect.arrayContaining([expect.any(String)]),
                            authority: {
                                address: expect.any(String),
                            },
                            deactivationSlot: expect.any(String),
                            lamports: expect.any(BigInt),
                            lastExtendedSlot: expect.any(String),
                            lastExtendedSlotStartIndex: expect.any(Number),
                            ownerProgram: {
                                address: 'AddressLookupTab1e1111111111111111111111111',
                            },
                        },
                    ]),
                },
            });
        });
        it('spl token program', async () => {
            expect.assertions(1);
            const variableValues = {
                programAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            };
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
                        ... on MintAccount {
                            decimals
                            isInitialized
                            mintAuthority {
                                address
                            }
                            supply
                        }
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
                    programAccounts: expect.arrayContaining([
                        // Mint account
                        {
                            address: expect.any(String),
                            decimals: expect.any(Number),
                            isInitialized: expect.any(Boolean),
                            lamports: expect.any(BigInt),
                            mintAuthority: {
                                address: expect.any(String),
                            },
                            ownerProgram: {
                                address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            },
                            supply: expect.any(String),
                        },
                        // Token account
                        {
                            address: expect.any(String),
                            isNative: expect.any(Boolean),
                            lamports: expect.any(BigInt),
                            mint: {
                                address: expect.any(String),
                            },
                            owner: {
                                address: expect.any(String),
                            },
                            ownerProgram: {
                                address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            },
                            state: expect.any(String),
                            tokenAmount: expect.objectContaining({
                                amount: expect.any(String),
                                decimals: expect.any(Number),
                                uiAmountString: expect.any(String),
                            }),
                        },
                    ]),
                },
            });
        });
        it('system program', async () => {
            expect.assertions(1);
            const variableValues = {
                programAddress: '11111111111111111111111111111111',
            };
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
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
                    programAccounts: expect.arrayContaining([
                        {
                            address: expect.any(String),
                            authority: {
                                address: expect.any(String),
                            },
                            blockhash: expect.any(String),
                            feeCalculator: {
                                lamportsPerSignature: expect.any(String),
                            },
                            lamports: expect.any(BigInt),
                            ownerProgram: {
                                address: '11111111111111111111111111111111',
                            },
                        },
                    ]),
                },
            });
        });
        it('stake program', async () => {
            expect.assertions(1);
            const variableValues = {
                programAddress: 'Stake11111111111111111111111111111111111111',
            };
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
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
                    programAccounts: expect.arrayContaining([
                        {
                            address: expect.any(String),
                            lamports: expect.any(BigInt),
                            meta: {
                                authorized: {
                                    staker: {
                                        address: expect.any(String),
                                    },
                                    withdrawer: {
                                        address: expect.any(String),
                                    },
                                },
                                lockup: {
                                    custodian: {
                                        address: expect.any(String),
                                    },
                                    epoch: expect.any(BigInt),
                                    unixTimestamp: expect.any(BigInt),
                                },
                                rentExemptReserve: expect.any(String),
                            },
                            ownerProgram: {
                                address: 'Stake11111111111111111111111111111111111111',
                            },
                            stake: {
                                creditsObserved: expect.any(BigInt),
                                delegation: {
                                    activationEpoch: expect.any(BigInt),
                                    deactivationEpoch: expect.any(BigInt),
                                    stake: expect.any(String),
                                    voter: {
                                        address: expect.any(String),
                                    },
                                },
                            },
                        },
                    ]),
                },
            });
        });
        it('vote program', async () => {
            expect.assertions(1);
            const variableValues = {
                programAddress: 'Vote111111111111111111111111111111111111111',
            };
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        address
                        lamports
                        ownerProgram {
                            address
                        }
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
                    programAccounts: expect.arrayContaining([
                        {
                            address: expect.any(String),
                            authorizedVoters: expect.arrayContaining([
                                {
                                    authorizedVoter: {
                                        address: expect.any(String),
                                    },
                                    epoch: expect.any(BigInt),
                                },
                            ]),
                            authorizedWithdrawer: {
                                address: expect.any(String),
                            },
                            commission: expect.any(Number),
                            epochCredits: expect.arrayContaining([
                                {
                                    credits: expect.any(String),
                                    epoch: expect.any(BigInt),
                                    previousCredits: expect.any(String),
                                },
                            ]),
                            lamports: expect.any(BigInt),
                            lastTimestamp: {
                                slot: expect.any(BigInt),
                                timestamp: expect.any(BigInt),
                            },
                            node: {
                                address: expect.any(String),
                            },
                            ownerProgram: {
                                address: 'Vote111111111111111111111111111111111111111',
                            },
                            priorVoters: expect.any(Array),
                            rootSlot: expect.any(BigInt),
                            votes: expect.arrayContaining([
                                {
                                    confirmationCount: expect.any(Number),
                                    slot: expect.any(BigInt),
                                },
                            ]),
                        },
                    ]),
                },
            });
        });
    });
    describe('when called with a dataSlice', () => {
        describe('when using base58 encoding', () => {
            it('returns the correct slice of the data', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                const variableValues = {
                    commitment: 'CONFIRMED',
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'BASE_58',
                    programAddress: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                };
                const source = /* GraphQL */ `
                    query testQuery(
                        $programAddress: Address!
                        $commitment: Commitment
                        $dataSlice: DataSlice
                        $encoding: AccountEncoding!
                    ) {
                        programAccounts(programAddress: $programAddress, commitment: $commitment) {
                            data(encoding: $encoding, dataSlice: $dataSlice)
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        programAccounts: expect.arrayContaining([
                            {
                                data: 'E8f4pET', // As tested on local RPC
                            },
                        ]),
                    },
                });
            });
        });
        describe('when using base64 encoding', () => {
            it('returns the correct slice of the data', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                const variableValues = {
                    commitment: 'CONFIRMED',
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'BASE_64',
                    programAddress: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                };
                const source = /* GraphQL */ `
                    query testQuery(
                        $programAddress: Address!
                        $commitment: Commitment
                        $dataSlice: DataSlice
                        $encoding: AccountEncoding!
                    ) {
                        programAccounts(programAddress: $programAddress, commitment: $commitment) {
                            data(dataSlice: $dataSlice, encoding: $encoding)
                        }
                    }
                `;
                const result = await rpcGraphQL.query(source, variableValues);
                expect(result).toMatchObject({
                    data: {
                        programAccounts: expect.arrayContaining([
                            {
                                data: 'dGVzdCA=', // As tested on local RPC
                            },
                        ]),
                    },
                });
            });
        });
    });
});
