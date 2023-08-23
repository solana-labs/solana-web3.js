import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getProgramAccounts', () => {
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
                expect.assertions(2);
                // See scripts/fixtures/gpa1.json
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        commitment,
                    })
                    .send();

                expect(accountInfo).toHaveLength(1);
                expect(accountInfo[0]).toMatchObject({
                    account: expect.objectContaining({
                        data: expect.any(String),
                        executable: expect.any(Boolean),
                        lamports: expect.any(BigInt),
                        owner: expect.any(String),
                        rentEpoch: expect.any(BigInt),
                    }),
                    pubkey: expect.any(String),
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const program =
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;
            const sendPromise = rpc
                .getProgramAccounts(program, {
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

    describe('when called with a program with no accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // randomly generated
            const program =
                'FZp6uJxwZbyZUCSF3Hyv494Su7w2MJEtNdYuc4RQHa2Z' as Base58EncodedAddress<'FZp6uJxwZbyZUCSF3Hyv494Su7w2MJEtNdYuc4RQHa2Z'>;
            const accountInfoPromise = rpc.getProgramAccounts(program).send();
            await expect(accountInfoPromise).resolves.toStrictEqual([]);
        });
    });

    describe('when called with a program with multiple accounts', () => {
        it('returns account info for all accounts', async () => {
            expect.assertions(3);
            // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
            const program =
                'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6' as Base58EncodedAddress<'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6'>;

            const accountInfo = await rpc.getProgramAccounts(program).send();

            expect(accountInfo).toHaveLength(2);
            expect(accountInfo[0]).toMatchObject({
                account: expect.objectContaining({
                    data: expect.any(String),
                    executable: expect.any(Boolean),
                    lamports: expect.any(BigInt),
                    owner: expect.any(String),
                    rentEpoch: expect.any(BigInt),
                }),
                pubkey: expect.any(String),
            });
            expect(accountInfo[1]).toMatchObject({
                account: expect.objectContaining({
                    data: expect.any(String),
                    executable: expect.any(Boolean),
                    lamports: expect.any(BigInt),
                    owner: expect.any(String),
                    rentEpoch: expect.any(BigInt),
                }),
                pubkey: expect.any(String),
            });
        });
    });

    describe('when called with base58 encoding', () => {
        describe('when called with withContext: false', () => {
            it('returns top-level account info with annotated base58 encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base58',
                        withContext: false,
                    })
                    .send();

                expect(accountInfo[0].account.data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
            });
        });

        describe('when called with withContext: true', () => {
            it('returns RPC Response with account info with annotated base58 encoding', async () => {
                expect.assertions(2);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base58',
                        withContext: true,
                    })
                    .send();

                expect(accountInfo.context.slot).toEqual(expect.any(BigInt));
                expect(accountInfo.value[0].account.data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
            });
        });
    });

    describe('when called with base64 encoding', () => {
        describe('when called with withContext: false', () => {
            it('returns top-level account info with annotated base64 encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base64',
                        withContext: false,
                    })
                    .send();

                expect(accountInfo[0].account.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });

        describe('when called with withContext: true', () => {
            it('returns RPC Response with account info with annotated base64 encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base64',
                        withContext: true,
                    })
                    .send();

                expect(accountInfo.value[0].account.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });
    });

    describe('when called with base64+zstd encoding', () => {
        describe('when called with withContext: false', () => {
            it('returns top-level account info with annotated base64+zstd encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base64+zstd',
                        withContext: false,
                    })
                    .send();

                expect(accountInfo[0].account.data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
            });
        });

        describe('when called with withContext: true', () => {
            it('returns RPC Response with account info with annotated base64+zstd encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfo = await rpc
                    .getProgramAccounts(program, {
                        encoding: 'base64+zstd',
                        withContext: true,
                    })
                    .send();

                expect(accountInfo.value[0].account.data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
            });
        });
    });

    describe('when called with jsonParsed encoding', () => {
        describe('for an account without parse-able JSON data', () => {
            describe('when called with withContext: false', () => {
                it('returns top-level account info with annotated base64 encoding', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/gpa1.json
                    // data is 'test data'
                    const program =
                        'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo[0].account.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
                });
            });

            describe('when called with withContext: true', () => {
                it('returns RPC Response with account info with annotated base64 encoding', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/gpa1.json
                    // data is 'test data'
                    const program =
                        'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo.value[0].account.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
                });
            });
        });

        describe('for an account with parse-able JSON data', () => {
            // Note: make sure these tests are resilient against adding more accounts under the same program
            describe('when called with withContext false', () => {
                it('returns parsed JSON data for AddressLookupTable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/address-lookup-table-account.json
                    const program =
                        'AddressLookupTab1e1111111111111111111111111' as Base58EncodedAddress<'AddressLookupTab1e1111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: expect.objectContaining({
                                                addresses: expect.any(Array),
                                                authority: expect.any(String),
                                                deactivationSlot: expect.any(String),
                                                lastExtendedSlot: expect.any(String),
                                                lastExtendedSlotStartIndex: expect.any(Number),
                                            }),
                                        }),
                                        program: 'address-lookup-table',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for BpfLoaderUpgradeable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                    const program =
                        'BPFLoaderUpgradeab1e11111111111111111111111' as Base58EncodedAddress<'BPFLoaderUpgradeab1e11111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                programData: expect.any(String),
                                            },
                                            type: 'program',
                                        }),
                                        program: 'bpf-upgradeable-loader',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Config validator account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-validator-account.json
                    const publicKey =
                        'Config1111111111111111111111111111111111111' as Base58EncodedAddress<'Config1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(publicKey, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                configData: expect.any(Object),
                                                keys: expect.any(Array),
                                            },
                                            type: 'validatorInfo',
                                        }),
                                        program: 'config',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Config stake account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-stake-account.json
                    const program =
                        'Config1111111111111111111111111111111111111' as Base58EncodedAddress<'Config1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                slashPenalty: expect.any(Number),
                                                warmupCooldownRate: expect.any(Number),
                                            },
                                            type: 'stakeConfig',
                                        }),
                                        program: 'config',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'StakeConfig11111111111111111111111111111111',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Nonce account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/nonce-account.json
                    const program =
                        '11111111111111111111111111111111' as Base58EncodedAddress<'11111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                authority: expect.any(String),
                                                blockhash: expect.any(String),
                                                feeCalculator: expect.any(Object),
                                            },
                                            type: 'initialized',
                                        }),
                                        program: 'nonce',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for SPL Token mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                decimals: expect.any(Number),
                                                freezeAuthority: null,
                                                isInitialized: expect.any(Boolean),
                                                mintAuthority: expect.any(String),
                                                supply: expect.any(String),
                                            },
                                            type: 'mint',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for SPL Token token account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-token-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                isNative: false,
                                                mint: expect.any(String),
                                                owner: expect.any(String),
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: expect.any(String),
                                                    decimals: expect.any(Number),
                                                    uiAmount: expect.any(Number),
                                                    uiAmountString: expect.any(String),
                                                },
                                            },
                                            type: 'account',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for SPL token multisig account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-multisig-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                isInitialized: expect.any(Boolean),
                                                numRequiredSigners: expect.any(Number),
                                                numValidSigners: expect.any(Number),
                                                signers: expect.any(Array),
                                            },
                                            type: 'multisig',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for SPL Token 22 mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-22-mint-account.json
                    const program =
                        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Base58EncodedAddress<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                decimals: expect.any(Number),
                                                extensions: expect.any(Array),
                                                freezeAuthority: expect.any(String),
                                                isInitialized: expect.any(Boolean),
                                                mintAuthority: expect.any(String),
                                                supply: expect.any(String),
                                            },
                                            type: 'mint',
                                        }),
                                        program: 'spl-token-2022',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Stake account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/stake-account.json
                    const program =
                        'Stake11111111111111111111111111111111111111' as Base58EncodedAddress<'Stake11111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                meta: expect.any(Object),
                                                stake: expect.any(Object),
                                            },
                                            type: 'delegated',
                                        }),
                                        program: 'stake',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Sysvar rent account', async () => {
                    expect.assertions(1);
                    // Sysvar accounts don't need a fixture
                    // They're owned by Sysvar1111111111111111111111111111111111111
                    const program =
                        'Sysvar1111111111111111111111111111111111111' as Base58EncodedAddress<'Sysvar1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                burnPercent: expect.any(Number),
                                                exemptionThreshold: expect.any(Number),
                                                lamportsPerByteYear: expect.any(String),
                                            },
                                            type: 'rent',
                                        }),
                                        program: 'sysvar',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'SysvarRent111111111111111111111111111111111',
                            }),
                        ])
                    );
                });

                it('returns parsed JSON data for Vote account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/vote-account.json
                    const program =
                        'Vote111111111111111111111111111111111111111' as Base58EncodedAddress<'Vote111111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    expect(accountInfo).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                authorizedVoters: expect.any(Array),
                                                authorizedWithdrawer: expect.any(String),
                                                commission: expect.any(Number),
                                                epochCredits: expect.any(Array),
                                                lastTimestamp: expect.any(Object),
                                                nodePubkey: expect.any(String),
                                                priorVoters: expect.any(Array),
                                                rootSlot: expect.any(BigInt),
                                                votes: expect.any(Array),
                                            },
                                            type: 'vote',
                                        }),
                                        program: 'vote',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                            }),
                        ])
                    );
                });
            });

            describe('when called with withContext true', () => {
                it('returns RPC response with parsed JSON data for AddressLookupTable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/address-lookup-table-account.json
                    const program =
                        'AddressLookupTab1e1111111111111111111111111' as Base58EncodedAddress<'AddressLookupTab1e1111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: expect.objectContaining({
                                                addresses: expect.any(Array),
                                                authority: expect.any(String),
                                                deactivationSlot: expect.any(String),
                                                lastExtendedSlot: expect.any(String),
                                                lastExtendedSlotStartIndex: expect.any(Number),
                                            }),
                                        }),
                                        program: 'address-lookup-table',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for BpfLoaderUpgradeable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                    const program =
                        'BPFLoaderUpgradeab1e11111111111111111111111' as Base58EncodedAddress<'BPFLoaderUpgradeab1e11111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                programData: expect.any(String),
                                            },
                                            type: 'program',
                                        }),
                                        program: 'bpf-upgradeable-loader',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Config validator account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-validator-account.json
                    const publicKey =
                        'Config1111111111111111111111111111111111111' as Base58EncodedAddress<'Config1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(publicKey, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                configData: expect.any(Object),
                                                keys: expect.any(Array),
                                            },
                                            type: 'validatorInfo',
                                        }),
                                        program: 'config',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Config stake account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-stake-account.json
                    const program =
                        'Config1111111111111111111111111111111111111' as Base58EncodedAddress<'Config1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                slashPenalty: expect.any(Number),
                                                warmupCooldownRate: expect.any(Number),
                                            },
                                            type: 'stakeConfig',
                                        }),
                                        program: 'config',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'StakeConfig11111111111111111111111111111111',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Nonce account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/nonce-account.json
                    const program =
                        '11111111111111111111111111111111' as Base58EncodedAddress<'11111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                authority: expect.any(String),
                                                blockhash: expect.any(String),
                                                feeCalculator: expect.any(Object),
                                            },
                                            type: 'initialized',
                                        }),
                                        program: 'nonce',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for SPL Token mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                decimals: expect.any(Number),
                                                freezeAuthority: null,
                                                isInitialized: expect.any(Boolean),
                                                mintAuthority: expect.any(String),
                                                supply: expect.any(String),
                                            },
                                            type: 'mint',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for SPL Token token account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-token-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                isNative: false,
                                                mint: expect.any(String),
                                                owner: expect.any(String),
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: expect.any(String),
                                                    decimals: expect.any(Number),
                                                    uiAmount: expect.any(Number),
                                                    uiAmountString: expect.any(String),
                                                },
                                            },
                                            type: 'account',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for SPL token multisig account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-multisig-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                isInitialized: expect.any(Boolean),
                                                numRequiredSigners: expect.any(Number),
                                                numValidSigners: expect.any(Number),
                                                signers: expect.any(Array),
                                            },
                                            type: 'multisig',
                                        }),
                                        program: 'spl-token',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for SPL Token 22 mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-22-mint-account.json
                    const program =
                        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Base58EncodedAddress<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                decimals: expect.any(Number),
                                                extensions: expect.any(Array),
                                                freezeAuthority: expect.any(String),
                                                isInitialized: expect.any(Boolean),
                                                mintAuthority: expect.any(String),
                                                supply: expect.any(String),
                                            },
                                            type: 'mint',
                                        }),
                                        program: 'spl-token-2022',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Stake account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/stake-account.json
                    const program =
                        'Stake11111111111111111111111111111111111111' as Base58EncodedAddress<'Stake11111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                meta: expect.any(Object),
                                                stake: expect.any(Object),
                                            },
                                            type: 'delegated',
                                        }),
                                        program: 'stake',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Sysvar rent account', async () => {
                    expect.assertions(1);
                    // Sysvar accounts don't need a fixture
                    // They're owned by Sysvar1111111111111111111111111111111111111
                    const program =
                        'Sysvar1111111111111111111111111111111111111' as Base58EncodedAddress<'Sysvar1111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                burnPercent: expect.any(Number),
                                                exemptionThreshold: expect.any(Number),
                                                lamportsPerByteYear: expect.any(String),
                                            },
                                            type: 'rent',
                                        }),
                                        program: 'sysvar',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: 'SysvarRent111111111111111111111111111111111',
                            }),
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Vote account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/vote-account.json
                    const program =
                        'Vote111111111111111111111111111111111111111' as Base58EncodedAddress<'Vote111111111111111111111111111111111111111'>;

                    const accountInfo = await rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    expect(accountInfo).toMatchObject({
                        value: expect.arrayContaining([
                            expect.objectContaining({
                                account: expect.objectContaining({
                                    data: {
                                        parsed: expect.objectContaining({
                                            info: {
                                                authorizedVoters: expect.any(Array),
                                                authorizedWithdrawer: expect.any(String),
                                                commission: expect.any(Number),
                                                epochCredits: expect.any(Array),
                                                lastTimestamp: expect.any(Object),
                                                nodePubkey: expect.any(String),
                                                priorVoters: expect.any(Array),
                                                rootSlot: expect.any(BigInt),
                                                votes: expect.any(Array),
                                            },
                                            type: 'vote',
                                        }),
                                        program: 'vote',
                                        space: expect.any(BigInt),
                                    },
                                }),
                                pubkey: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                            }),
                        ]),
                    });
                });
            });
        });
    });

    describe('when called with no encoding', () => {
        it('returns base58 data without an annotation', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            // data is 'test data'
            const program =
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

            const accountInfo = await rpc.getProgramAccounts(program).send();
            expect(accountInfo[0].account.data).toBe('2Uw1bpnsXxu3e');
        });
    });

    describe('when called with a dataSlice', () => {
        it('returns the correct slice of the data', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa1.json
            // data is 'test data'
            const program =
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Base58EncodedAddress<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

            const accountInfo = await rpc
                .getProgramAccounts(program, {
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo[0].account.data).toStrictEqual(['dGVzdCA=', 'base64']);
        });
    });
});
