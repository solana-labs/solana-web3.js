import { Address } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getAccountInfo', () => {
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
                expect.assertions(1);
                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                const publicKey =
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        commitment,
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        data: '2Uw1bpnsXxu3e',
                        executable: false,
                        lamports: 5000000n,
                        owner: '11111111111111111111111111111111',
                        rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                        space: 9n,
                    },
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;
            const sendPromise = rpc
                .getAccountInfo(publicKey, {
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

    describe('when called with an account that does not exist', () => {
        it('returns a null RPC response', async () => {
            expect.assertions(1);
            // randomly generated
            const publicKey =
                'Bb39jXh8b1rWHymSqM46kKXYwzA35ChNZAMCZ3wSDAMV' as Address<'Bb39jXh8b1rWHymSqM46kKXYwzA35ChNZAMCZ3wSDAMV'>;
            const accountInfoPromise = rpc.getAccountInfo(publicKey).send();
            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: null,
            });
        });
    });

    describe('when called with base58 encoding', () => {
        it('returns account info with annotated base58 encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base58',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['2Uw1bpnsXxu3e', 'base58']);
        });
    });

    describe('when called with base64 encoding', () => {
        it('returns account info with annotated base64 encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
        });
    });

    describe('when called with base64+zstd encoding', () => {
        it('returns account info with annotated base64+zstd encoding', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    encoding: 'base64+zstd',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['KLUv/QBYSQAAdGVzdCBkYXRh', 'base64+zstd']);
        });
    });

    describe('when called with jsonParsed encoding', () => {
        describe('for an account without parse-able JSON data', () => {
            it('falls back to annotated base64', async () => {
                expect.assertions(1);
                // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
                const publicKey =
                    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

                const accountInfo = await rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo.value?.data).toStrictEqual(['dGVzdCBkYXRh', 'base64']);
            });
        });

        describe('for an account with parse-able JSON data', () => {
            it('returns parsed JSON data for AddressLookupTable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/address-lookup-table-account.json
                const publicKey =
                    '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n' as Address<'2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for BpfLoaderUpgradeable account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                const publicKey =
                    'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk' as Address<'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk'>;

                const accountInfo = await rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                expect(accountInfo).toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Config validator account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-validator-account.json
                const publicKey =
                    'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY' as Address<'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Config stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/config-stake-account.json
                const publicKey =
                    'StakeConfig11111111111111111111111111111111' as Address<'StakeConfig11111111111111111111111111111111'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Nonce account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/nonce-account.json
                const publicKey =
                    'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU' as Address<'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        data: {
                            parsed: {
                                info: {
                                    authority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                    blockhash: 'TcVy2wVcs7WqWVopv8LAJBHQfqVYZrm8UDqjDvBFQt8',
                                    feeCalculator: {
                                        lamportsPerSignature: expect.stringMatching(/\d+/),
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
                });
            });

            it('returns parsed JSON data for SPL Token mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' as Address<'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for SPL Token token account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca' as Address<'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for SPL token multisig account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-account.json
                const publicKey =
                    '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88' as Address<'4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for SPL Token 22 mint account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-22-mint-account.json
                const publicKey =
                    'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo' as Address<'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Stake account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/stake-account.json
                const publicKey =
                    'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN' as Address<'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Sysvar rent account', async () => {
                expect.assertions(1);
                // Sysvar accounts don't need a fixture
                const publicKey =
                    'SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
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
                });
            });

            it('returns parsed JSON data for Vote account', async () => {
                expect.assertions(1);
                // See scripts/fixtures/vote-account.json
                const publicKey =
                    '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp' as Address<'4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp'>;

                const accountInfoPromise = rpc
                    .getAccountInfo(publicKey, {
                        encoding: 'jsonParsed',
                    })
                    .send();

                await expect(accountInfoPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        data: {
                            parsed: {
                                info: {
                                    authorizedVoters: [
                                        {
                                            authorizedVoter: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                            epoch: 529n,
                                        },
                                    ],
                                    authorizedWithdrawer: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    commission: 50,
                                    epochCredits: [
                                        {
                                            credits: '68697256',
                                            epoch: 466n,
                                            previousCredits: '68325825',
                                        },
                                        {
                                            credits: '69068118',
                                            epoch: 467n,
                                            previousCredits: '68697256',
                                        },
                                        {
                                            credits: '69430620',
                                            epoch: 468n,
                                            previousCredits: '69068118',
                                        },
                                        {
                                            credits: '69794003',
                                            epoch: 469n,
                                            previousCredits: '69430620',
                                        },
                                        {
                                            credits: '70159712',
                                            epoch: 470n,
                                            previousCredits: '69794003',
                                        },
                                        {
                                            credits: '70501260',
                                            epoch: 471n,
                                            previousCredits: '70159712',
                                        },
                                        {
                                            credits: '70912799',
                                            epoch: 472n,
                                            previousCredits: '70501260',
                                        },
                                        {
                                            credits: '71344738',
                                            epoch: 473n,
                                            previousCredits: '70912799',
                                        },
                                        {
                                            credits: '71771375',
                                            epoch: 474n,
                                            previousCredits: '71344738',
                                        },
                                        {
                                            credits: '72199121',
                                            epoch: 475n,
                                            previousCredits: '71771375',
                                        },
                                        {
                                            credits: '72610239',
                                            epoch: 476n,
                                            previousCredits: '72199121',
                                        },
                                        {
                                            credits: '73037789',
                                            epoch: 477n,
                                            previousCredits: '72610239',
                                        },
                                        {
                                            credits: '73467937',
                                            epoch: 478n,
                                            previousCredits: '73037789',
                                        },
                                        {
                                            credits: '73899842',
                                            epoch: 479n,
                                            previousCredits: '73467937',
                                        },
                                        {
                                            credits: '74331794',
                                            epoch: 480n,
                                            previousCredits: '73899842',
                                        },
                                        {
                                            credits: '74763356',
                                            epoch: 481n,
                                            previousCredits: '74331794',
                                        },
                                        {
                                            credits: '75191111',
                                            epoch: 482n,
                                            previousCredits: '74763356',
                                        },
                                        {
                                            credits: '75622560',
                                            epoch: 483n,
                                            previousCredits: '75191111',
                                        },
                                        {
                                            credits: '76053995',
                                            epoch: 484n,
                                            previousCredits: '75622560',
                                        },
                                        {
                                            credits: '76485533',
                                            epoch: 485n,
                                            previousCredits: '76053995',
                                        },
                                        {
                                            credits: '76917053',
                                            epoch: 486n,
                                            previousCredits: '76485533',
                                        },
                                        {
                                            credits: '77348508',
                                            epoch: 487n,
                                            previousCredits: '76917053',
                                        },
                                        {
                                            credits: '77780039',
                                            epoch: 488n,
                                            previousCredits: '77348508',
                                        },
                                        {
                                            credits: '78211607',
                                            epoch: 489n,
                                            previousCredits: '77780039',
                                        },
                                        {
                                            credits: '78643086',
                                            epoch: 490n,
                                            previousCredits: '78211607',
                                        },
                                        {
                                            credits: '79074661',
                                            epoch: 491n,
                                            previousCredits: '78643086',
                                        },
                                        {
                                            credits: '79506108',
                                            epoch: 492n,
                                            previousCredits: '79074661',
                                        },
                                        {
                                            credits: '79937647',
                                            epoch: 493n,
                                            previousCredits: '79506108',
                                        },
                                        {
                                            credits: '80369113',
                                            epoch: 494n,
                                            previousCredits: '79937647',
                                        },
                                        {
                                            credits: '80800638',
                                            epoch: 495n,
                                            previousCredits: '80369113',
                                        },
                                        {
                                            credits: '81231874',
                                            epoch: 496n,
                                            previousCredits: '80800638',
                                        },
                                        {
                                            credits: '81663293',
                                            epoch: 497n,
                                            previousCredits: '81231874',
                                        },
                                        {
                                            credits: '82094860',
                                            epoch: 498n,
                                            previousCredits: '81663293',
                                        },
                                        {
                                            credits: '82526326',
                                            epoch: 499n,
                                            previousCredits: '82094860',
                                        },
                                        {
                                            credits: '82952320',
                                            epoch: 500n,
                                            previousCredits: '82526326',
                                        },
                                        {
                                            credits: '83383787',
                                            epoch: 501n,
                                            previousCredits: '82952320',
                                        },
                                        {
                                            credits: '83813221',
                                            epoch: 502n,
                                            previousCredits: '83383787',
                                        },
                                        {
                                            credits: '84244778',
                                            epoch: 503n,
                                            previousCredits: '83813221',
                                        },
                                        {
                                            credits: '84676328',
                                            epoch: 504n,
                                            previousCredits: '84244778',
                                        },
                                        {
                                            credits: '85103114',
                                            epoch: 505n,
                                            previousCredits: '84676328',
                                        },
                                        {
                                            credits: '85534570',
                                            epoch: 506n,
                                            previousCredits: '85103114',
                                        },
                                        {
                                            credits: '85966120',
                                            epoch: 507n,
                                            previousCredits: '85534570',
                                        },
                                        {
                                            credits: '86396198',
                                            epoch: 508n,
                                            previousCredits: '85966120',
                                        },
                                        {
                                            credits: '86827687',
                                            epoch: 509n,
                                            previousCredits: '86396198',
                                        },
                                        {
                                            credits: '87259154',
                                            epoch: 510n,
                                            previousCredits: '86827687',
                                        },
                                        {
                                            credits: '87690675',
                                            epoch: 511n,
                                            previousCredits: '87259154',
                                        },
                                        {
                                            credits: '88122214',
                                            epoch: 512n,
                                            previousCredits: '87690675',
                                        },
                                        {
                                            credits: '88553712',
                                            epoch: 513n,
                                            previousCredits: '88122214',
                                        },
                                        {
                                            credits: '88985258',
                                            epoch: 514n,
                                            previousCredits: '88553712',
                                        },
                                        {
                                            credits: '89416694',
                                            epoch: 515n,
                                            previousCredits: '88985258',
                                        },
                                        {
                                            credits: '89843578',
                                            epoch: 516n,
                                            previousCredits: '89416694',
                                        },
                                        {
                                            credits: '90258082',
                                            epoch: 517n,
                                            previousCredits: '89843578',
                                        },
                                        {
                                            credits: '90689639',
                                            epoch: 518n,
                                            previousCredits: '90258082',
                                        },
                                        {
                                            credits: '91121164',
                                            epoch: 519n,
                                            previousCredits: '90689639',
                                        },
                                        {
                                            credits: '91552708',
                                            epoch: 520n,
                                            previousCredits: '91121164',
                                        },
                                        {
                                            credits: '91984232',
                                            epoch: 521n,
                                            previousCredits: '91552708',
                                        },
                                        {
                                            credits: '92415662',
                                            epoch: 522n,
                                            previousCredits: '91984232',
                                        },
                                        {
                                            credits: '92847120',
                                            epoch: 523n,
                                            previousCredits: '92415662',
                                        },
                                        {
                                            credits: '93278557',
                                            epoch: 524n,
                                            previousCredits: '92847120',
                                        },
                                        {
                                            credits: '93710089',
                                            epoch: 525n,
                                            previousCredits: '93278557',
                                        },
                                        {
                                            credits: '94141580',
                                            epoch: 526n,
                                            previousCredits: '93710089',
                                        },
                                        {
                                            credits: '94569612',
                                            epoch: 527n,
                                            previousCredits: '94141580',
                                        },
                                        {
                                            credits: '95001010',
                                            epoch: 528n,
                                            previousCredits: '94569612',
                                        },
                                        {
                                            credits: '95357116',
                                            epoch: 529n,
                                            previousCredits: '95001010',
                                        },
                                    ],
                                    lastTimestamp: {
                                        slot: 228884530n,
                                        timestamp: 1689090220n,
                                    },
                                    nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    priorVoters: [],
                                    rootSlot: 228884499n,
                                    votes: [
                                        {
                                            confirmationCount: 31,
                                            slot: 228884500n,
                                        },
                                        {
                                            confirmationCount: 30,
                                            slot: 228884501n,
                                        },
                                        {
                                            confirmationCount: 29,
                                            slot: 228884502n,
                                        },
                                        {
                                            confirmationCount: 28,
                                            slot: 228884503n,
                                        },
                                        {
                                            confirmationCount: 27,
                                            slot: 228884504n,
                                        },
                                        {
                                            confirmationCount: 26,
                                            slot: 228884505n,
                                        },
                                        {
                                            confirmationCount: 25,
                                            slot: 228884506n,
                                        },
                                        {
                                            confirmationCount: 24,
                                            slot: 228884507n,
                                        },
                                        {
                                            confirmationCount: 23,
                                            slot: 228884508n,
                                        },
                                        {
                                            confirmationCount: 22,
                                            slot: 228884509n,
                                        },
                                        {
                                            confirmationCount: 21,
                                            slot: 228884510n,
                                        },
                                        {
                                            confirmationCount: 20,
                                            slot: 228884511n,
                                        },
                                        {
                                            confirmationCount: 19,
                                            slot: 228884512n,
                                        },
                                        {
                                            confirmationCount: 18,
                                            slot: 228884513n,
                                        },
                                        {
                                            confirmationCount: 17,
                                            slot: 228884514n,
                                        },
                                        {
                                            confirmationCount: 16,
                                            slot: 228884515n,
                                        },
                                        {
                                            confirmationCount: 15,
                                            slot: 228884516n,
                                        },
                                        {
                                            confirmationCount: 14,
                                            slot: 228884517n,
                                        },
                                        {
                                            confirmationCount: 13,
                                            slot: 228884518n,
                                        },
                                        {
                                            confirmationCount: 12,
                                            slot: 228884519n,
                                        },
                                        {
                                            confirmationCount: 11,
                                            slot: 228884520n,
                                        },
                                        {
                                            confirmationCount: 10,
                                            slot: 228884521n,
                                        },
                                        {
                                            confirmationCount: 9,
                                            slot: 228884522n,
                                        },
                                        {
                                            confirmationCount: 8,
                                            slot: 228884523n,
                                        },
                                        {
                                            confirmationCount: 7,
                                            slot: 228884524n,
                                        },
                                        {
                                            confirmationCount: 6,
                                            slot: 228884525n,
                                        },
                                        {
                                            confirmationCount: 5,
                                            slot: 228884526n,
                                        },
                                        {
                                            confirmationCount: 4,
                                            slot: 228884527n,
                                        },
                                        {
                                            confirmationCount: 3,
                                            slot: 228884528n,
                                        },
                                        {
                                            confirmationCount: 2,
                                            slot: 228884529n,
                                        },
                                        {
                                            confirmationCount: 1,
                                            slot: 228884530n,
                                        },
                                    ],
                                },
                                type: 'vote',
                            },
                            program: 'vote',
                            space: 3731n,
                        },
                        executable: false,
                        lamports: 10290815n,
                        owner: 'Vote111111111111111111111111111111111111111',
                        rentEpoch: 0n,
                        space: 3731n,
                    },
                });
            });
        });
    });

    describe('when called with no encoding', () => {
        it('returns base58 data without an annotation', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc.getAccountInfo(publicKey, {}).send();

            expect(accountInfo.value?.data).toBe('2Uw1bpnsXxu3e');
        });
    });

    describe('when called with a dataSlice', () => {
        it('returns the correct slice of the data', async () => {
            expect.assertions(1);
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            // data is 'test data'
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

            const accountInfo = await rpc
                .getAccountInfo(publicKey, {
                    dataSlice: {
                        length: 5,
                        offset: 0,
                    },
                    encoding: 'base64',
                })
                .send();

            expect(accountInfo.value?.data).toStrictEqual(['dGVzdCA=', 'base64']);
        });
    });
});
