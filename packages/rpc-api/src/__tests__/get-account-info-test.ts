import type { Address } from '@solana/addresses';
import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetAccountInfoApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getAccountInfo', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
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
            expect.assertions(3);
            const publicKey =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;
            const sendPromise = rpc
                .getAccountInfo(publicKey, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await Promise.all([
                expect(sendPromise).rejects.toThrow(SolanaError),
                expect(sendPromise).rejects.toHaveProperty(
                    'context.__code',
                    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
                ),
                expect(sendPromise).rejects.toHaveProperty('context.contextSlot', expect.any(Number)),
            ]);
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
                                            epoch: 656n,
                                        },
                                    ],
                                    authorizedWithdrawer: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    commission: 50,
                                    epochCredits: [
                                        {
                                            credits: '117764802',
                                            epoch: 593n,
                                            previousCredits: '117762806',
                                        },
                                        {
                                            credits: '118161978',
                                            epoch: 594n,
                                            previousCredits: '117764802',
                                        },
                                        {
                                            credits: '118593951',
                                            epoch: 595n,
                                            previousCredits: '118161978',
                                        },
                                        {
                                            credits: '119025928',
                                            epoch: 596n,
                                            previousCredits: '118593951',
                                        },
                                        {
                                            credits: '119456860',
                                            epoch: 597n,
                                            previousCredits: '119025928',
                                        },
                                        {
                                            credits: '119770741',
                                            epoch: 598n,
                                            previousCredits: '119456860',
                                        },
                                        {
                                            credits: '119773739',
                                            epoch: 599n,
                                            previousCredits: '119770741',
                                        },
                                        {
                                            credits: '119777233',
                                            epoch: 600n,
                                            previousCredits: '119773739',
                                        },
                                        {
                                            credits: '119780053',
                                            epoch: 601n,
                                            previousCredits: '119777233',
                                        },
                                        {
                                            credits: '119783284',
                                            epoch: 602n,
                                            previousCredits: '119780053',
                                        },
                                        {
                                            credits: '119786399',
                                            epoch: 603n,
                                            previousCredits: '119783284',
                                        },
                                        {
                                            credits: '119788422',
                                            epoch: 604n,
                                            previousCredits: '119786399',
                                        },
                                        {
                                            credits: '119791169',
                                            epoch: 605n,
                                            previousCredits: '119788422',
                                        },
                                        {
                                            credits: '119793299',
                                            epoch: 606n,
                                            previousCredits: '119791169',
                                        },
                                        {
                                            credits: '119796454',
                                            epoch: 607n,
                                            previousCredits: '119793299',
                                        },
                                        {
                                            credits: '119799687',
                                            epoch: 608n,
                                            previousCredits: '119796454',
                                        },
                                        {
                                            credits: '119802861',
                                            epoch: 609n,
                                            previousCredits: '119799687',
                                        },
                                        {
                                            credits: '119804679',
                                            epoch: 610n,
                                            previousCredits: '119802861',
                                        },
                                        {
                                            credits: '119807952',
                                            epoch: 611n,
                                            previousCredits: '119804679',
                                        },
                                        {
                                            credits: '119810634',
                                            epoch: 612n,
                                            previousCredits: '119807952',
                                        },
                                        {
                                            credits: '119813372',
                                            epoch: 613n,
                                            previousCredits: '119810634',
                                        },
                                        {
                                            credits: '119816503',
                                            epoch: 614n,
                                            previousCredits: '119813372',
                                        },
                                        {
                                            credits: '119819850',
                                            epoch: 615n,
                                            previousCredits: '119816503',
                                        },
                                        {
                                            credits: '119823406',
                                            epoch: 616n,
                                            previousCredits: '119819850',
                                        },
                                        {
                                            credits: '119825752',
                                            epoch: 617n,
                                            previousCredits: '119823406',
                                        },
                                        {
                                            credits: '119828458',
                                            epoch: 618n,
                                            previousCredits: '119825752',
                                        },
                                        {
                                            credits: '119830399',
                                            epoch: 619n,
                                            previousCredits: '119828458',
                                        },
                                        {
                                            credits: '119833206',
                                            epoch: 620n,
                                            previousCredits: '119830399',
                                        },
                                        {
                                            credits: '119836333',
                                            epoch: 621n,
                                            previousCredits: '119833206',
                                        },
                                        {
                                            credits: '119839690',
                                            epoch: 622n,
                                            previousCredits: '119836333',
                                        },
                                        {
                                            credits: '119842672',
                                            epoch: 623n,
                                            previousCredits: '119839690',
                                        },
                                        {
                                            credits: '119845737',
                                            epoch: 624n,
                                            previousCredits: '119842672',
                                        },
                                        {
                                            credits: '119848231',
                                            epoch: 625n,
                                            previousCredits: '119845737',
                                        },
                                        {
                                            credits: '119851184',
                                            epoch: 626n,
                                            previousCredits: '119848231',
                                        },
                                        {
                                            credits: '119854617',
                                            epoch: 627n,
                                            previousCredits: '119851184',
                                        },
                                        {
                                            credits: '119856852',
                                            epoch: 628n,
                                            previousCredits: '119854617',
                                        },
                                        {
                                            credits: '119860362',
                                            epoch: 629n,
                                            previousCredits: '119856852',
                                        },
                                        {
                                            credits: '119863578',
                                            epoch: 630n,
                                            previousCredits: '119860362',
                                        },
                                        {
                                            credits: '119867336',
                                            epoch: 631n,
                                            previousCredits: '119863578',
                                        },
                                        {
                                            credits: '119871382',
                                            epoch: 632n,
                                            previousCredits: '119867336',
                                        },
                                        {
                                            credits: '119874725',
                                            epoch: 633n,
                                            previousCredits: '119871382',
                                        },
                                        {
                                            credits: '119878010',
                                            epoch: 634n,
                                            previousCredits: '119874725',
                                        },
                                        {
                                            credits: '119881019',
                                            epoch: 635n,
                                            previousCredits: '119878010',
                                        },
                                        {
                                            credits: '119884533',
                                            epoch: 636n,
                                            previousCredits: '119881019',
                                        },
                                        {
                                            credits: '119887482',
                                            epoch: 637n,
                                            previousCredits: '119884533',
                                        },
                                        {
                                            credits: '119890917',
                                            epoch: 638n,
                                            previousCredits: '119887482',
                                        },
                                        {
                                            credits: '119891583',
                                            epoch: 639n,
                                            previousCredits: '119890917',
                                        },
                                        {
                                            credits: '119894976',
                                            epoch: 640n,
                                            previousCredits: '119891583',
                                        },
                                        {
                                            credits: '119897217',
                                            epoch: 641n,
                                            previousCredits: '119894976',
                                        },
                                        {
                                            credits: '119899074',
                                            epoch: 642n,
                                            previousCredits: '119897217',
                                        },
                                        {
                                            credits: '119902893',
                                            epoch: 643n,
                                            previousCredits: '119899074',
                                        },
                                        {
                                            credits: '119905968',
                                            epoch: 644n,
                                            previousCredits: '119902893',
                                        },
                                        {
                                            credits: '119909166',
                                            epoch: 645n,
                                            previousCredits: '119905968',
                                        },
                                        {
                                            credits: '119912335',
                                            epoch: 646n,
                                            previousCredits: '119909166',
                                        },
                                        {
                                            credits: '119916478',
                                            epoch: 647n,
                                            previousCredits: '119912335',
                                        },
                                        {
                                            credits: '119919918',
                                            epoch: 648n,
                                            previousCredits: '119916478',
                                        },
                                        {
                                            credits: '120283578',
                                            epoch: 649n,
                                            previousCredits: '119919918',
                                        },
                                        {
                                            credits: '120325223',
                                            epoch: 650n,
                                            previousCredits: '120283578',
                                        },
                                        {
                                            credits: '120329512',
                                            epoch: 651n,
                                            previousCredits: '120325223',
                                        },
                                        {
                                            credits: '120333844',
                                            epoch: 652n,
                                            previousCredits: '120329512',
                                        },
                                        {
                                            credits: '120337635',
                                            epoch: 653n,
                                            previousCredits: '120333844',
                                        },
                                        {
                                            credits: '120341034',
                                            epoch: 654n,
                                            previousCredits: '120337635',
                                        },
                                        {
                                            credits: '120345192',
                                            epoch: 655n,
                                            previousCredits: '120341034',
                                        },
                                        {
                                            credits: '120347138',
                                            epoch: 656n,
                                            previousCredits: '120345192',
                                        },
                                    ],
                                    lastTimestamp: {
                                        slot: 283619438n,
                                        timestamp: 1709828565n,
                                    },
                                    nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                    priorVoters: [],
                                    rootSlot: 283619407n,
                                    votes: [
                                        {
                                            confirmationCount: 31,
                                            slot: 283619408n,
                                        },
                                        {
                                            confirmationCount: 30,
                                            slot: 283619409n,
                                        },
                                        {
                                            confirmationCount: 29,
                                            slot: 283619410n,
                                        },
                                        {
                                            confirmationCount: 28,
                                            slot: 283619411n,
                                        },
                                        {
                                            confirmationCount: 27,
                                            slot: 283619412n,
                                        },
                                        {
                                            confirmationCount: 26,
                                            slot: 283619413n,
                                        },
                                        {
                                            confirmationCount: 25,
                                            slot: 283619414n,
                                        },
                                        {
                                            confirmationCount: 24,
                                            slot: 283619415n,
                                        },
                                        {
                                            confirmationCount: 23,
                                            slot: 283619416n,
                                        },
                                        {
                                            confirmationCount: 22,
                                            slot: 283619417n,
                                        },
                                        {
                                            confirmationCount: 21,
                                            slot: 283619418n,
                                        },
                                        {
                                            confirmationCount: 20,
                                            slot: 283619419n,
                                        },
                                        {
                                            confirmationCount: 19,
                                            slot: 283619420n,
                                        },
                                        {
                                            confirmationCount: 18,
                                            slot: 283619421n,
                                        },
                                        {
                                            confirmationCount: 17,
                                            slot: 283619422n,
                                        },
                                        {
                                            confirmationCount: 16,
                                            slot: 283619423n,
                                        },
                                        {
                                            confirmationCount: 15,
                                            slot: 283619424n,
                                        },
                                        {
                                            confirmationCount: 14,
                                            slot: 283619425n,
                                        },
                                        {
                                            confirmationCount: 13,
                                            slot: 283619426n,
                                        },
                                        {
                                            confirmationCount: 12,
                                            slot: 283619427n,
                                        },
                                        {
                                            confirmationCount: 11,
                                            slot: 283619428n,
                                        },
                                        {
                                            confirmationCount: 10,
                                            slot: 283619429n,
                                        },
                                        {
                                            confirmationCount: 9,
                                            slot: 283619430n,
                                        },
                                        {
                                            confirmationCount: 8,
                                            slot: 283619431n,
                                        },
                                        {
                                            confirmationCount: 7,
                                            slot: 283619432n,
                                        },
                                        {
                                            confirmationCount: 6,
                                            slot: 283619433n,
                                        },
                                        {
                                            confirmationCount: 5,
                                            slot: 283619434n,
                                        },
                                        {
                                            confirmationCount: 4,
                                            slot: 283619435n,
                                        },
                                        {
                                            confirmationCount: 3,
                                            slot: 283619436n,
                                        },
                                        {
                                            confirmationCount: 2,
                                            slot: 283619437n,
                                        },
                                        {
                                            confirmationCount: 1,
                                            slot: 283619438n,
                                        },
                                    ],
                                },
                                type: 'vote',
                            },
                            program: 'vote',
                            space: 3762n,
                        },
                        executable: false,
                        lamports: 10290815n,
                        owner: 'Vote111111111111111111111111111111111111111',
                        rentEpoch: 0n,
                        space: 3762n,
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
