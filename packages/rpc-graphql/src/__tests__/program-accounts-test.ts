/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../rpc';

describe('programAccounts', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    let rpcGraphQL: RpcGraphQL;
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
        // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
        const variableValues = {
            programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
            commitment: 'confirmed',
        };
        it("can query program accounts' lamports balances", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($programAddress: String!, $commitment: Commitment) {
                programAccounts(programAddress: $programAddress, commitment: $commitment) {
                    account {
                        lamports
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([{ account: { lamports: expect.any(BigInt) } }]),
                },
            });
        });
        it("can query program accounts' executable value", async () => {
            expect.assertions(1);
            const source = `
            query testQuery($programAddress: String!, $commitment: Commitment) {
                programAccounts(programAddress: $programAddress, commitment: $commitment) {
                    account {
                        executable
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([{ account: { executable: expect.any(Boolean) } }]),
                },
            });
        });
        it('can query multiple fields', async () => {
            expect.assertions(1);
            const source = `
            query testQuery($programAddress: String!, $commitment: Commitment) {
                programAccounts(programAddress: $programAddress, commitment: $commitment) {
                    account {
                        executable
                        lamports
                        rentEpoch
                    }
                }
            }
        `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            account: {
                                executable: expect.any(Boolean),
                                lamports: expect.any(BigInt),
                                rentEpoch: expect.any(BigInt),
                            },
                        },
                    ]),
                },
            });
        });
    });
    describe('account data queries', () => {
        it("can get program accounts' data as base58", async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
            const variableValues = {
                programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
                commitment: 'confirmed',
                encoding: 'base58',
            };
            const source = `
                query testQuery($programAddress: String!, $commitment: Commitment, $encoding: AccountEncoding) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment, encoding: $encoding) {
                        account {
                            ... on AccountBase58 {
                                data
                                executable
                            }
                        },
                        pubkey
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            account: {
                                data: '2Uw1bpnsXxu3e',
                                executable: false,
                            },
                            pubkey: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                        },
                        {
                            account: {
                                data: '2Uw1bpnsXxu3e',
                                executable: false,
                            },
                            pubkey: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                        },
                    ]),
                },
            });
        });
        it("can get program accounts' data as base64", async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
            const variableValues = {
                programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
                commitment: 'confirmed',
                encoding: 'base64',
            };
            const source = `
                query testQuery($programAddress: String!, $commitment: Commitment, $encoding: AccountEncoding) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment, encoding: $encoding) {
                        account {
                            ... on AccountBase64 {
                                data
                                executable
                            }
                        },
                        pubkey
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            account: {
                                data: 'dGVzdCBkYXRh',
                                executable: false,
                            },
                            pubkey: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                        },
                        {
                            account: {
                                data: 'dGVzdCBkYXRh',
                                executable: false,
                            },
                            pubkey: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                        },
                    ]),
                },
            });
        });
        it("can get program accounts' data as base64+zstd", async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
            const variableValues = {
                programAddress: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
                commitment: 'confirmed',
                encoding: 'base64Zstd',
            };
            const source = `
                query testQuery($programAddress: String!, $commitment: Commitment, $encoding: AccountEncoding) {
                    programAccounts(programAddress: $programAddress, commitment: $commitment, encoding: $encoding) {
                        account {
                            ... on AccountBase64Zstd {
                                data
                                executable
                            }
                        },
                        pubkey
                    }
                }
            `;
            const result = await rpcGraphQL.query(source, variableValues);
            expect(result).toMatchObject({
                data: {
                    programAccounts: expect.arrayContaining([
                        {
                            account: {
                                data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                                executable: false,
                            },
                            pubkey: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                        },
                        {
                            account: {
                                data: 'KLUv/QBYSQAAdGVzdCBkYXRh',
                                executable: false,
                            },
                            pubkey: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
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
            const source = `
                query testQuery($programAddress: String!) {
                    programAccounts(programAddress: $programAddress) {
                        account {
                            ... on LookupTableAccount {
                                data {
                                    parsed {
                                        info {
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
                            account: {
                                data: {
                                    parsed: {
                                        info: {
                                            addresses: expect.arrayContaining([expect.any(String)]),
                                            authority: {
                                                address: expect.any(String),
                                            },
                                            deactivationSlot: expect.any(String),
                                            lastExtendedSlot: expect.any(String),
                                            lastExtendedSlotStartIndex: expect.any(Number),
                                        },
                                    },
                                },
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
            const source = `
                query testQuery($programAddress: String!) {
                    programAccounts(programAddress: $programAddress) {
                        account {
                            ... on MintAccount {
                                data {
                                    parsed {
                                        info {
                                            decimals
                                            isInitialized
                                            mintAuthority {
                                                address
                                            }
                                            supply
                                        }
                                    }
                                }
                            }
                            ... on TokenAccount {
                                data {
                                    parsed {
                                        info {
                                            isNative
                                            mint
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
                            account: {
                                data: {
                                    parsed: {
                                        info: {
                                            decimals: expect.any(Number),
                                            isInitialized: expect.any(Boolean),
                                            mintAuthority: {
                                                address: expect.any(String),
                                            },
                                            supply: expect.any(String),
                                        },
                                    },
                                },
                            },
                        },
                        // Token account
                        {
                            account: {
                                data: {
                                    parsed: {
                                        info: {
                                            isNative: expect.any(Boolean),
                                            mint: expect.any(String),
                                            owner: {
                                                address: expect.any(String),
                                            },
                                            state: expect.any(String),
                                            tokenAmount: expect.objectContaining({
                                                amount: expect.any(String),
                                                decimals: expect.any(Number),
                                                uiAmountString: expect.any(String),
                                            }),
                                        },
                                    },
                                },
                            },
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
            const source = `
                query testQuery($programAddress: String!) {
                    programAccounts(programAddress: $programAddress) {
                        account {
                            ... on NonceAccount {
                                data {
                                    parsed {
                                        info {
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
                            account: {
                                data: {
                                    parsed: {
                                        info: {
                                            authority: {
                                                address: expect.any(String),
                                            },
                                            blockhash: expect.any(String),
                                            feeCalculator: {
                                                lamportsPerSignature: expect.any(String),
                                            },
                                        },
                                    },
                                },
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
            const source = `
                query testQuery($programAddress: String!) {
                    programAccounts(programAddress: $programAddress) {
                        account {
                            ... on StakeAccount {
                                data {
                                    parsed {
                                        info {
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
                            account: {
                                data: {
                                    parsed: {
                                        info: {
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
            const source = `
                query testQuery($programAddress: String!) {
                    programAccounts(programAddress: $programAddress) {
                        account {
                            ... on VoteAccount {
                                data {
                                    parsed {
                                        info {
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
                            account: {
                                data: {
                                    parsed: {
                                        info: {
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
                                            lastTimestamp: {
                                                slot: expect.any(BigInt),
                                                timestamp: expect.any(BigInt),
                                            },
                                            node: {
                                                address: expect.any(String),
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
                                    },
                                },
                            },
                        },
                    ]),
                },
            });
        });
    });
});
