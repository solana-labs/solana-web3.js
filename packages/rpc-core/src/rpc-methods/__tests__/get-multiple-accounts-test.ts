import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getMultipleAccounts', () => {
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
            it('returns account info for multiple accounts', async () => {
                expect.assertions(3);

                const multipleAccounts = await rpc
                    .getMultipleAccounts(
                        [
                            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                            'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>,
                            // See scripts/fixtures/4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc.json
                            '4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Base58EncodedAddress<'4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc'>,
                        ],
                        {
                            commitment,
                        }
                    )
                    .send();

                expect(multipleAccounts.value).toHaveLength(2);
                multipleAccounts.value.forEach(accountInfo => {
                    expect(accountInfo).toMatchObject({
                        data: expect.any(Array),
                        executable: expect.any(Boolean),
                        lamports: expect.any(BigInt),
                        owner: expect.any(String),
                        rentEpoch: expect.any(BigInt),
                        space: expect.any(BigInt),
                    });
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
                .getMultipleAccounts([publicKey], {
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

    describe('when called with an empty array of accounts', () => {
        it('returns an empty array RPC response', async () => {
            expect.assertions(1);

            const multipleAccountsPromise = rpc.getMultipleAccounts([]).send();
            await expect(multipleAccountsPromise).resolves.toMatchObject({
                value: [],
            });
        });
    });

    describe('when called with accounts including one that does not exist', () => {
        it('returns a list with null for the one that does not exist', async () => {
            expect.assertions(3);

            const multipleAccounts = await rpc
                .getMultipleAccounts([
                    // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>,
                    // Randomly generated
                    '8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG' as Base58EncodedAddress<'8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG'>,
                ])
                .send();

            expect(multipleAccounts.value).toHaveLength(2);
            expect(multipleAccounts.value[0]).toMatchObject({
                data: expect.any(Array),
                executable: expect.any(Boolean),
                lamports: expect.any(BigInt),
                owner: expect.any(String),
                rentEpoch: expect.any(BigInt),
                space: expect.any(BigInt),
            });
            expect(multipleAccounts.value[1]).toBeNull();
        });
    });

    describe('when called with accounts where none exist', () => {
        it('returns a list with null values', async () => {
            expect.assertions(1);

            const multipleAccountsPromise = rpc
                .getMultipleAccounts([
                    // Randomly generated
                    '8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG' as Base58EncodedAddress<'8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG'>,
                    // Randomly generated
                    '6JkwLherbVYPVF5sXGHm7qd9Lpd6gzinU4P792FkgdfS' as Base58EncodedAddress<'6JkwLherbVYPVF5sXGHm7qd9Lpd6gzinU4P792FkgdfS'>,
                ])
                .send();

            await expect(multipleAccountsPromise).resolves.toMatchObject({
                value: [null, null],
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
                .getMultipleAccounts([publicKey], {
                    encoding: 'base58',
                })
                .send();

            expect(accountInfo.value[0].data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
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
                .getMultipleAccounts([publicKey], {
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value[0].data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
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
                .getMultipleAccounts([publicKey], {
                    encoding: 'base64+zstd',
                })
                .send();

            expect(accountInfo.value[0].data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
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
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0].data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });

        describe('for an account with parse-able JSON data', () => {
            it('returns parsed JSON data for AddressLookupTable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/address-lookup-table-account.json
                const publicKey =
                    '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n' as Base58EncodedAddress<'2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
                        parsed: expect.objectContaining({
                            info: {
                                addresses: expect.any(Array),
                                authority: expect.any(String),
                                deactivationSlot: expect.any(String),
                                lastExtendedSlot: expect.any(String),
                                lastExtendedSlotStartIndex: expect.any(Number),
                            },
                            type: 'lookupTable',
                        }),
                        program: 'address-lookup-table',
                        space: expect.any(BigInt),
                    }),
                });
            });

            it('returns parsed JSON data for BpfLoaderUpgradeable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                const publicKey =
                    'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk' as Base58EncodedAddress<'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
                        parsed: expect.objectContaining({
                            info: {
                                programData: expect.any(String),
                            },
                            type: 'program',
                        }),
                        program: 'bpf-upgradeable-loader',
                        space: expect.any(BigInt),
                    }),
                });
            });

            it('returns parsed JSON data for Config validator account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-validator-account.json
                const publicKey =
                    'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY' as Base58EncodedAddress<'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
                        parsed: expect.objectContaining({
                            info: {
                                configData: expect.any(Object),
                                keys: expect.any(Array),
                            },
                            type: 'validatorInfo',
                        }),
                        program: 'config',
                        space: expect.any(BigInt),
                    }),
                });
            });

            it('returns parsed JSON data for Config stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-stake-account.json
                const publicKey =
                    'StakeConfig11111111111111111111111111111111' as Base58EncodedAddress<'StakeConfig11111111111111111111111111111111'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
                        parsed: expect.objectContaining({
                            info: {
                                slashPenalty: expect.any(Number),
                                warmupCooldownRate: expect.any(Number),
                            },
                            type: 'stakeConfig',
                        }),
                        program: 'config',
                        space: expect.any(BigInt),
                    }),
                });
            });

            it('returns parsed JSON data for Nonce account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/nonce-account.json
                const publicKey =
                    'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU' as Base58EncodedAddress<'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for SPL Token mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Base58EncodedAddress<'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for SPL Token token account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca' as Base58EncodedAddress<'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for SPL token multisig account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88' as Base58EncodedAddress<'4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for SPL Token 22 mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-22-mint-account.json
                const publicKey =
                    'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo' as Base58EncodedAddress<'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for Stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/stake-account.json
                const publicKey =
                    'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN' as Base58EncodedAddress<'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
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
                });
            });

            it('returns parsed JSON data for Sysvar rent account', async () => {
                expect.assertions(1);
                // Sysvar accounts don't need a fixture
                const publicKey =
                    'SysvarRent111111111111111111111111111111111' as Base58EncodedAddress<'SysvarRent111111111111111111111111111111111'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });

            it('returns parsed JSON data for Vote account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/vote-account.json
                const publicKey =
                    '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp' as Base58EncodedAddress<'4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp'>;

                const accountInfo = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value[0]).toMatchObject({
                    data: expect.objectContaining({
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
                    }),
                });
            });
        });
    });

    describe('when called with no encoding', () => {
        it('returns annotated base64 data', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc.getMultipleAccounts([publicKey], {}).send();

            expect(accountInfo.value[0].data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
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
                .getMultipleAccounts([publicKey], {
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value[0].data).toStrictEqual(['dGVzdCA=', 'base64']);
        });
    });
});
