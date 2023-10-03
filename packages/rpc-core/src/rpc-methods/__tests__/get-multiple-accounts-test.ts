import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

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
                expect.assertions(1);

                const multipleAccountsPromise = rpc
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

                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: ['dGVzdCBkYXRh', 'base64'],
                            executable: false,
                            lamports: 5000000n,
                            owner: '11111111111111111111111111111111',
                            rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                            space: 9n,
                        },
                        {
                            data: ['', 'base64'],
                            executable: false,
                            lamports: 5000000n,
                            owner: '11111111111111111111111111111111',
                            rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                            space: 0n,
                        },
                    ],
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
            await expect(multipleAccountsPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with accounts including one that does not exist', () => {
        it('returns a list with null for the one that does not exist', async () => {
            expect.assertions(1);

            const multipleAccountsPromise = rpc
                .getMultipleAccounts([
                    // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>,
                    // Randomly generated
                    '8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG' as Base58EncodedAddress<'8HgNKsvrrQh6DoAtugeFdxYw38zGR1yi2FtYWqVvH9uG'>,
                ])
                .send();

            await expect(multipleAccountsPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        data: ['dGVzdCBkYXRh', 'base64'],
                        executable: false,
                        lamports: 5000000n,
                        owner: '11111111111111111111111111111111',
                        rentEpoch: 18446744073709551616n,
                        space: 9n,
                    },
                    null,
                ],
            });
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

            await expect(multipleAccountsPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
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

            const multipleAccounts = await rpc
                .getMultipleAccounts([publicKey], {
                    encoding: 'base58',
                })
                .send();

            expect(multipleAccounts.value[0]?.data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
        });
    });

    describe('when called with base64 encoding', () => {
        it('returns account info with annotated base64 encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const multipleAccounts = await rpc
                .getMultipleAccounts([publicKey], {
                    encoding: 'base64',
                })
                .send();

            expect(multipleAccounts.value[0]?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
        });
    });

    describe('when called with base64+zstd encoding', () => {
        it('returns account info with annotated base64+zstd encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const multipleAccounts = await rpc
                .getMultipleAccounts([publicKey], {
                    encoding: 'base64+zstd',
                })
                .send();

            expect(multipleAccounts.value[0]?.data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
        });
    });

    describe('when called with jsonParsed encoding', () => {
        describe('for an account without parse-able JSON data', () => {
            it('falls back to annotated base64', async () => {
                expect.assertions(1);
                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                const publicKey =
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

                const multipleAccounts = await rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(multipleAccounts.value[0]?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });

        describe('for an account with parse-able JSON data', () => {
            it('returns parsed JSON data for AddressLookupTable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/address-lookup-table-account.json
                const publicKey =
                    '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n' as Base58EncodedAddress<'2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        addresses: [
                                            'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn',
                                            'FWscgV4VDSsMxkQg7jZ4HksqjLyadJS5RiCnAVZv2se9',
                                            '6PoVp5L36hYU5oDWjZiUnhcKqVnkwYXgditMKufxhTuo',
                                            '9J4yDqU6wBkdhP5bmJhukhsEzBkaAXiBmii52kTdxpQq',
                                            '25FkCKVY4nMLaqCWhWoDt3idfNRBHkyQttTd4VCibYoU',
                                            'CSYi7PVzvEA2iiDWhR8eN6EBjZpKyzPX1aMbayrk9YTD',
                                            'CSYi7PVzvEA2iiDWhR8eN6EBjZpKyzPX1aMbayrk9YTD',
                                            '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B',
                                            '6ndVLNpgFDZZS1Ph7A9oZKD15Z6FurMMeVrsYiP6NUw8',
                                            '9zqNWNXHPLkW6LcNbBboF6tFvAHoT97UFczUusGLdGhE',
                                            '3nkuz3xksLcsok3NexdDLWZqUMehrPQj23a8fkPnZ4ng',
                                            'EL9gfMj99EvcV5x3NxHbRQsJKbavFcFvvNxbpJg6CvqM',
                                            'EWmQeCKE6MsByDGdL7sktuL5eCfTUBKSLQe12tG3mFfn',
                                            '4oEA4jBmBbZmrzAxnConZP93LQuwh9bV5T1y7NLFwtMk',
                                            'EHjk9n6jCrDLVGhC2vjvdzaFP2gPonK7Up1tVg9Zc11y',
                                            'GsPu9qRgkF9RDFnQjXh3TngvAdQPYUnTSaeG1K4uNjj3',
                                            '9J4yDqU6wBkdhP5bmJhukhsEzBkaAXiBmii52kTdxpQq',
                                            'FoNprxYzYmwnYzhM964CxEHchhj17YREieJtSAXg9FMU',
                                            'FAH4Nd2GhQmLWxHcVN63rnc4EomJw2EEpA5ukGuzZyKc',
                                            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                            'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                                            'FAH4Nd2GhQmLWxHcVN63rnc4EomJw2EEpA5ukGuzZyKc',
                                            'CZw6RPBy9BecE4hVBG4cK4E64gJN7gT9D1EZKCGRqkHV',
                                            '2Q1PhUaRw3GeaCxv2ud8iaxWAZjpisdU5bvUTtVacgJU',
                                            'Sysvar1nstructions1111111111111111111111111',
                                            'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg',
                                            '11111111111111111111111111111111',
                                            'SysvarRent111111111111111111111111111111111',
                                            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                                            '7YVgrijuM9eSNgeyEpZBw7cZ3ncXhUbHkst9NjAVQQd4',
                                            '4ncLWXmfoFGyGuCXKLFxguCAYE4ioUp4RKKoUHtJPNGN',
                                            'FZYB8CfgDexiDv9Vm3vHBuEBNxy97yetVTU6nq1nPyxQ',
                                            'CJBCQppi8NjNxqzyoHJG2h97RinfKePP1ZUMMWcxp339',
                                            '9WPz1JB6xWb5Cn3uvL9T2hR2sKPfVB5GANoVM7pf1zvG',
                                            '5gb1Vq2ZVtx25w8TDnpGTzPk8nZXgZ1TLWvSt6hnBiXn',
                                            'mm8fDa7jiufFGD6h4foq9vdmTRxDeDSTKB9CZynwQQs',
                                            '4cdDuEivqaGiF2Yu6LjdgTukmfgsHoxfhjTua59xXexP',
                                            'AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5',
                                            'FoNprxYzYmwnYzhM964CxEHchhj17YREieJtSAXg9FMU',
                                        ],
                                        authority: '4msgK65vdz5ADUAB3eTQGpF388NuQUAoknLxutUQJd5B',
                                        deactivationSlot: '204699277',
                                        lastExtendedSlot: '204699234',
                                        lastExtendedSlotStartIndex: 20,
                                    },
                                    type: 'lookupTable',
                                },
                                program: 'address-lookup-table',
                                space: 1304n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'AddressLookupTab1e1111111111111111111111111',
                            rentEpoch: 0n,
                            space: 1304n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for BpfLoaderUpgradeable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                const publicKey =
                    'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk' as Base58EncodedAddress<'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        programData: '3vnUTQbDuCgfVn7yQcigUwMQNGkLBZ7GfKWb3gYbAY23',
                                    },
                                    type: 'program',
                                },
                                program: 'bpf-upgradeable-loader',
                                space: 36n,
                            },
                            executable: true,
                            lamports: 10290815n,
                            owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                            rentEpoch: 0n,
                            space: 36n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Config validator account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-validator-account.json
                const publicKey =
                    'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY' as Base58EncodedAddress<'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        configData: {
                                            name: 'HoldTheNode',
                                            website: 'https://holdthenode.com',
                                        },
                                        keys: [
                                            {
                                                pubkey: 'Va1idator1nfo111111111111111111111111111111',
                                                signer: false,
                                            },
                                            {
                                                pubkey: '5hvJ19nRgtzAkosb5bcx9bqeN2QA1Qwxq4M349Q2L6s2',
                                                signer: true,
                                            },
                                        ],
                                    },
                                    type: 'validatorInfo',
                                },
                                program: 'config',
                                space: 643n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'Config1111111111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 643n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Config stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-stake-account.json
                const publicKey =
                    'StakeConfig11111111111111111111111111111111' as Base58EncodedAddress<'StakeConfig11111111111111111111111111111111'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        slashPenalty: 12,
                                        warmupCooldownRate: 0.25,
                                    },
                                    type: 'stakeConfig',
                                },
                                program: 'config',
                                space: 10n,
                            },
                            executable: false,
                            lamports: 960480n,
                            owner: 'Config1111111111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 10n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Nonce account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/nonce-account.json
                const publicKey =
                    'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU' as Base58EncodedAddress<'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        authority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                        blockhash: 'TcVy2wVcs7WqWVopv8LAJBHQfqVYZrm8UDqjDvBFQt8',
                                        feeCalculator: {
                                            lamportsPerSignature: '5000',
                                        },
                                    },
                                    type: 'initialized',
                                },
                                program: 'nonce',
                                space: 80n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: '11111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 80n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for SPL Token mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Base58EncodedAddress<'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        decimals: 6,
                                        freezeAuthority: null,
                                        isInitialized: true,
                                        mintAuthority: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                                        supply: '1690580887590527729',
                                    },
                                    type: 'mint',
                                },
                                program: 'spl-token',
                                space: 82n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 82n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for SPL Token token account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca' as Base58EncodedAddress<'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        isNative: false,
                                        mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                                        owner: '6UsGbaMgchgj4wiwKKuE1v5URHdcDfEiMSM25QpesKir',
                                        state: 'initialized',
                                        tokenAmount: {
                                            amount: '9999999779500000',
                                            decimals: 6,
                                            uiAmount: 9999999779.5,
                                            uiAmountString: '9999999779.5',
                                        },
                                    },
                                    type: 'account',
                                },
                                program: 'spl-token',
                                space: 165n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for SPL token multisig account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88' as Base58EncodedAddress<'4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        isInitialized: true,
                                        numRequiredSigners: 2,
                                        numValidSigners: 2,
                                        signers: [
                                            'Fkc4FN7PPhyGsAcHPW3dBBJ4BvtYkDr2rBFBgFpvy3nB',
                                            '5scSndUhfZJ8j8wZz5UNHhvuPBhvN1RboTdkKSvFHLtW',
                                        ],
                                    },
                                    type: 'multisig',
                                },
                                program: 'spl-token',
                                space: 355n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 355n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for SPL Token 22 mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-22-mint-account.json
                const publicKey =
                    'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo' as Base58EncodedAddress<'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        decimals: 5,
                                        extensions: [
                                            {
                                                extension: 'transferFeeConfig',
                                                state: {
                                                    newerTransferFee: {
                                                        epoch: 457n,
                                                        maximumFee: 3906250000000000000n,
                                                        transferFeeBasisPoints: 690,
                                                    },
                                                    olderTransferFee: {
                                                        epoch: 455n,
                                                        maximumFee: 3906250000000000000n,
                                                        transferFeeBasisPoints: 0,
                                                    },
                                                    transferFeeConfigAuthority:
                                                        '7MyTjmRygJoCuDBUtAuSugiYZFULD2SWaoUTmtjtRDzD',
                                                    withdrawWithheldAuthority:
                                                        '7MyTjmRygJoCuDBUtAuSugiYZFULD2SWaoUTmtjtRDzD',
                                                    withheldAmount: 0n,
                                                },
                                            },
                                        ],
                                        freezeAuthority: '7MyTjmRygJoCuDBUtAuSugiYZFULD2SWaoUTmtjtRDzD',
                                        isInitialized: true,
                                        mintAuthority: '7MyTjmRygJoCuDBUtAuSugiYZFULD2SWaoUTmtjtRDzD',
                                        supply: '99998926239436',
                                    },
                                    type: 'mint',
                                },
                                program: 'spl-token-2022',
                                space: 278n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                            rentEpoch: 0n,
                            space: 278n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/stake-account.json
                const publicKey =
                    'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN' as Base58EncodedAddress<'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        meta: {
                                            authorized: {
                                                staker: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                                withdrawer: '3HRNKNXafhr3wE9NSXRpNVdFYt6EVygdqFwqf6WpG57V',
                                            },
                                            lockup: {
                                                custodian: '11111111111111111111111111111111',
                                                epoch: 0n,
                                                unixTimestamp: 0n,
                                            },
                                            rentExemptReserve: '2282880',
                                        },
                                        stake: {
                                            creditsObserved: 169965713n,
                                            delegation: {
                                                activationEpoch: '386',
                                                deactivationEpoch: '471',
                                                stake: '8007935',
                                                voter: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu',
                                                warmupCooldownRate: 0.25,
                                            },
                                        },
                                    },
                                    type: 'delegated',
                                },
                                program: 'stake',
                                space: 200n,
                            },
                            executable: false,
                            lamports: 10290815n,
                            owner: 'Stake11111111111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 200n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Sysvar rent account', async () => {
                expect.assertions(1);
                // Sysvar accounts don't need a fixture
                const publicKey =
                    'SysvarRent111111111111111111111111111111111' as Base58EncodedAddress<'SysvarRent111111111111111111111111111111111'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        burnPercent: 50,
                                        exemptionThreshold: 2,
                                        lamportsPerByteYear: '3480',
                                    },
                                    type: 'rent',
                                },
                                program: 'sysvar',
                                space: 17n,
                            },
                            executable: false,
                            lamports: 1009200n,
                            owner: 'Sysvar1111111111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 17n,
                        },
                    ],
                });
            });

            it('returns parsed JSON data for Vote account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/vote-account.json
                const publicKey =
                    'GJS8gK24LDqsJm2JznSpy3yMyGccDiRMCqfeGGyQ79So' as Base58EncodedAddress<'GJS8gK24LDqsJm2JznSpy3yMyGccDiRMCqfeGGyQ79So'>;

                const multipleAccountsPromise = rpc
                    .getMultipleAccounts([publicKey], {
                        encoding: 'jsonParsed',
                    })
                    .send();

                // Length 1
                await expect(multipleAccountsPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            data: {
                                parsed: {
                                    info: {
                                        authorizedVoters: [
                                            {
                                                authorizedVoter: 'GJS8gK24LDqsJm2JznSpy3yMyGccDiRMCqfeGGyQ79So',
                                                epoch: 0n,
                                            },
                                        ],
                                        authorizedWithdrawer: 'GJS8gK24LDqsJm2JznSpy3yMyGccDiRMCqfeGGyQ79So',
                                        commission: 50,
                                        epochCredits: [
                                            {
                                                credits: '1446',
                                                epoch: 0n,
                                                previousCredits: '0',
                                            },
                                        ],
                                        lastTimestamp: {
                                            slot: 1476n,
                                            timestamp: 1696376636n,
                                        },
                                        nodePubkey: '4BDqs4bkR1aqGG57jrgRcbMfhScxTiv3DU9BSCL6SUMd',
                                        priorVoters: [],
                                        rootSlot: 1445n,
                                        votes: [
                                            {
                                                confirmationCount: 31,
                                                slot: 1446n,
                                            },
                                            {
                                                confirmationCount: 30,
                                                slot: 1447n,
                                            },
                                            {
                                                confirmationCount: 29,
                                                slot: 1448n,
                                            },
                                            {
                                                confirmationCount: 28,
                                                slot: 1449n,
                                            },
                                            {
                                                confirmationCount: 27,
                                                slot: 1450n,
                                            },
                                            {
                                                confirmationCount: 26,
                                                slot: 1451n,
                                            },
                                            {
                                                confirmationCount: 25,
                                                slot: 1452n,
                                            },
                                            {
                                                confirmationCount: 24,
                                                slot: 1453n,
                                            },
                                            {
                                                confirmationCount: 23,
                                                slot: 1454n,
                                            },
                                            {
                                                confirmationCount: 22,
                                                slot: 1455n,
                                            },
                                            {
                                                confirmationCount: 21,
                                                slot: 1456n,
                                            },
                                            {
                                                confirmationCount: 20,
                                                slot: 1457n,
                                            },
                                            {
                                                confirmationCount: 19,
                                                slot: 1458n,
                                            },
                                            {
                                                confirmationCount: 18,
                                                slot: 1459n,
                                            },
                                            {
                                                confirmationCount: 17,
                                                slot: 1460n,
                                            },
                                            {
                                                confirmationCount: 16,
                                                slot: 1461n,
                                            },
                                            {
                                                confirmationCount: 15,
                                                slot: 1462n,
                                            },
                                            {
                                                confirmationCount: 14,
                                                slot: 1463n,
                                            },
                                            {
                                                confirmationCount: 13,
                                                slot: 1464n,
                                            },
                                            {
                                                confirmationCount: 12,
                                                slot: 1465n,
                                            },
                                            {
                                                confirmationCount: 11,
                                                slot: 1466n,
                                            },
                                            {
                                                confirmationCount: 10,
                                                slot: 1467n,
                                            },
                                            {
                                                confirmationCount: 9,
                                                slot: 1468n,
                                            },
                                            {
                                                confirmationCount: 8,
                                                slot: 1469n,
                                            },
                                            {
                                                confirmationCount: 7,
                                                slot: 1470n,
                                            },
                                            {
                                                confirmationCount: 6,
                                                slot: 1471n,
                                            },
                                            {
                                                confirmationCount: 5,
                                                slot: 1472n,
                                            },
                                            {
                                                confirmationCount: 4,
                                                slot: 1473n,
                                            },
                                            {
                                                confirmationCount: 3,
                                                slot: 1474n,
                                            },
                                            {
                                                confirmationCount: 2,
                                                slot: 1475n,
                                            },
                                            {
                                                confirmationCount: 1,
                                                slot: 1476n,
                                            },
                                        ],
                                    },
                                    type: 'vote',
                                },
                                program: 'vote',
                                space: 3762n,
                            },
                            executable: false,
                            lamports: 27074400n,
                            owner: 'Vote111111111111111111111111111111111111111',
                            rentEpoch: 0n,
                            space: 3762n,
                        },
                    ],
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

            const multipleAccounts = await rpc.getMultipleAccounts([publicKey], {}).send();

            expect(multipleAccounts.value[0]?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
        });
    });

    describe('when called with a dataSlice', () => {
        it('returns the correct slice of the data', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Base58EncodedAddress<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const multipleAccounts = await rpc
                .getMultipleAccounts([publicKey], {
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'base64',
                })
                .send();

            expect(multipleAccounts.value[0]?.data).toStrictEqual(['dGVzdCA=', 'base64']);
        });
    });
});
