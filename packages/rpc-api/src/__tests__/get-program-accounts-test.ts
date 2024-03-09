import { open } from 'node:fs/promises';

import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';
import path from 'path';

import { GetProgramAccountsApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

const validatorKeypairPath = path.resolve(__dirname, '../../../../test-ledger/validator-keypair.json');
const voteAccountKeypairPath = path.resolve(__dirname, '../../../../test-ledger/vote-account-keypair.json');

async function getNodeAddress(path: string) {
    const file = await open(path);
    try {
        let secretKey: Uint8Array | undefined;
        for await (const line of file.readLines({ encoding: 'binary' })) {
            secretKey = new Uint8Array(JSON.parse(line));
            break; // Only need the first line
        }
        if (secretKey) {
            const publicKey = secretKey.slice(32, 64);
            const expectedAddress = getBase58Decoder().decode(publicKey);
            return expectedAddress as Address;
        }
        throw new Error(`Failed to read keypair file \`${path}\``);
    } finally {
        await file.close();
    }
}

describe('getProgramAccounts', () => {
    let rpc: Rpc<GetProgramAccountsApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns account info', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

                const accountInfosPromise = rpc
                    .getProgramAccounts(program, {
                        commitment,
                    })
                    .send();

                await expect(accountInfosPromise).resolves.toStrictEqual(
                    // We can't guarantee ordering is preserved across test runs
                    expect.arrayContaining([
                        {
                            account: {
                                data: '2Uw1bpnsXxu3e',
                                executable: false,
                                lamports: 5000000n,
                                owner: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                                rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                                space: 9n,
                            },
                            pubkey: 'CcYNb7WqpjaMrNr7B1mapaNfWctZRH7LyAjWRLBGt1Fk',
                        },
                    ]),
                );
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(3);
            const program =
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;
            const sendPromise = rpc
                .getProgramAccounts(program, {
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

    describe('when called with a program with no accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // randomly generated
            const program =
                'FZp6uJxwZbyZUCSF3Hyv494Su7w2MJEtNdYuc4RQHa2Z' as Address<'FZp6uJxwZbyZUCSF3Hyv494Su7w2MJEtNdYuc4RQHa2Z'>;
            const accountInfoPromise = rpc.getProgramAccounts(program).send();
            await expect(accountInfoPromise).resolves.toStrictEqual([]);
        });
    });

    describe('when called with a program with multiple accounts', () => {
        it('returns account info for all accounts', async () => {
            expect.assertions(1);
            // See scripts/fixtures/gpa2-1.json, scripts/fixtures/gpa2-2.json,
            const program =
                'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6' as Address<'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6'>;

            const accountInfosPromise = rpc.getProgramAccounts(program).send();

            await expect(accountInfosPromise).resolves.toStrictEqual(
                // We can't guarantee ordering is preserved across test runs
                expect.arrayContaining([
                    {
                        account: {
                            data: '2Uw1bpnsXxu3e',
                            executable: false,
                            lamports: 5000000n,
                            owner: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
                            rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                            space: 9n,
                        },
                        pubkey: 'C5q1p5UiCVrt6vcLJDGcS4AZ98fahKyb9XkDRdqATK17',
                    },
                    {
                        account: {
                            data: '2Uw1bpnsXxu3e',
                            executable: false,
                            lamports: 5000000n,
                            owner: 'AmtpVzo6H6qQCP9dH9wfu5hfa8kKaAFpTJ4aamPYR6V6',
                            rentEpoch: 18446744073709551616n, // TODO: This number loses precision
                            space: 9n,
                        },
                        pubkey: 'Hhsoev7Apk5dMbktzLUrsTHuMq9e9GSYBaLcnN2PfdKS',
                    },
                ]),
            );
        });
    });

    describe('when called with base58 encoding', () => {
        describe('when called with withContext: false', () => {
            it('returns top-level account info with annotated base58 encoding', async () => {
                expect.assertions(1);
                // See scripts/fixtures/gpa1.json
                // data is 'test data'
                const program =
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                        'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                        'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                        'AddressLookupTab1e1111111111111111111111111' as Address<'AddressLookupTab1e1111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 1304n,
                                },
                                pubkey: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for BpfLoaderUpgradeable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                    const program =
                        'BPFLoaderUpgradeab1e11111111111111111111111' as Address<'BPFLoaderUpgradeab1e11111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                // Token 2022 data account
                                                programData: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                                            },
                                            type: 'program',
                                        },
                                        program: 'bpf-upgradeable-loader',
                                        space: 36n,
                                    },
                                    executable: true,
                                    lamports: expect.any(BigInt),
                                    owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 36n,
                                },
                                pubkey: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                            },
                            {
                                account: {
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
                                    lamports: expect.any(BigInt),
                                    owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 36n,
                                },
                                pubkey: 'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object), // Huge
                                            type: 'programData',
                                        },
                                        program: 'bpf-upgradeable-loader',
                                        space: expect.any(BigInt),
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt),
                                    owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: expect.any(BigInt),
                                },
                                // Token 2022 data account
                                pubkey: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for Config stake and validator accounts', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-stake-account.json
                    // See scripts/fixtures/config-validator-account.json
                    const publicKey =
                        'Config1111111111111111111111111111111111111' as Address<'Config1111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(publicKey, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 10n,
                                },
                                pubkey: 'StakeConfig11111111111111111111111111111111',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 643n,
                                },
                                pubkey: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for Nonce account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/nonce-account.json
                    const program = '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    // Too large to try to match all accounts owned by system program
                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 80n,
                                },
                                pubkey: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for accounts owned by SPL Token', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-account.json
                    // See scripts/fixtures/spl-token-token-account.json
                    // See scripts/fixtures/spl-token-multisig-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: null,
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 1000000000n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: 1n,
                                    space: 82n,
                                },
                                pubkey: 'So11111111111111111111111111111111111111112',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 10290815n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '1000000000000',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 10290815n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 355n,
                                },
                                pubkey: '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                delegate: 'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL',
                                                delegatedAmount: {
                                                    amount: '100000000000',
                                                    decimals: 9,
                                                    uiAmount: 100,
                                                    uiAmountString: '100',
                                                },
                                                isNative: false,
                                                mint: '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M',
                                                owner: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: '1000000000000',
                                                    decimals: 9,
                                                    uiAmount: 1000,
                                                    uiAmountString: '1000',
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                isNative: false,
                                                mint: '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf',
                                                owner: 'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL',
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: '0',
                                                    decimals: 9,
                                                    uiAmount: 0,
                                                    uiAmountString: '0',
                                                },
                                            },
                                            type: 'account',
                                        },
                                        program: 'spl-token',
                                        space: 165n,
                                    },
                                    executable: false,
                                    lamports: 2039280n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 1461600n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: 'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for SPL Token 22 mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-22-mint-account.json
                    const program =
                        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 278n,
                                },
                                pubkey: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for Stake account', async () => {
                    expect.assertions(1);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // TODO: Test validator does not write this keypair to JSON
                    // See solana-labs/solana/pull/33014
                    const stakeAddress = expect.any(String);
                    // See scripts/fixtures/stake-account.json
                    const program =
                        'Stake11111111111111111111111111111111111111' as Address<'Stake11111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            // Local validator
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                meta: {
                                                    authorized: {
                                                        staker: stakeAddress,
                                                        withdrawer: stakeAddress,
                                                    },
                                                    lockup: {
                                                        custodian: '11111111111111111111111111111111',
                                                        epoch: 0n,
                                                        unixTimestamp: 0n,
                                                    },
                                                    rentExemptReserve: '2282880',
                                                },
                                                stake: {
                                                    creditsObserved: expect.any(BigInt), // Changes
                                                    delegation: {
                                                        activationEpoch: expect.any(String), // Changes
                                                        deactivationEpoch: expect.any(String), // Changes
                                                        stake: expect.any(String), // Changes
                                                        voter: voteAccountAddress,
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
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Stake11111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 200n,
                                },
                                pubkey: stakeAddress,
                            },
                            // Fixture
                            {
                                account: {
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
                                                    creditsObserved: expect.any(BigInt), // Changes
                                                    delegation: {
                                                        activationEpoch: expect.any(String), // Changes
                                                        deactivationEpoch: expect.any(String), // Changes
                                                        stake: expect.any(String), // Changes
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
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Stake11111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 200n,
                                },
                                pubkey: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for Sysvar rent account', async () => {
                    expect.assertions(1);
                    // Sysvar accounts don't need a fixture
                    // They're owned by Sysvar1111111111111111111111111111111111111
                    const program =
                        'Sysvar1111111111111111111111111111111111111' as Address<'Sysvar1111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'clock',
                                        },
                                        program: 'sysvar',
                                        space: 40n,
                                    },
                                    executable: false,
                                    lamports: 1169280n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 40n,
                                },
                                pubkey: 'SysvarC1ock11111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'epochSchedule',
                                        },
                                        program: 'sysvar',
                                        space: 33n,
                                    },
                                    executable: false,
                                    lamports: 1120560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 33n,
                                },
                                pubkey: 'SysvarEpochSchedu1e111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'fees',
                                        },
                                        program: 'sysvar',
                                        space: 8n,
                                    },
                                    executable: false,
                                    lamports: 946560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 8n,
                                },
                                pubkey: 'SysvarFees111111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'recentBlockhashes',
                                        },
                                        program: 'sysvar',
                                        space: 6008n,
                                    },
                                    executable: false,
                                    lamports: 42706560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 6008n,
                                },
                                pubkey: 'SysvarRecentB1ockHashes11111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'rent',
                                        },
                                        program: 'sysvar',
                                        space: 17n,
                                    },
                                    executable: false,
                                    lamports: 1009200n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 17n,
                                },
                                pubkey: 'SysvarRent111111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'slotHistory',
                                        },
                                        program: 'sysvar',
                                        space: 131097n,
                                    },
                                    executable: false,
                                    lamports: 913326000n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 131097n,
                                },
                                pubkey: 'SysvarS1otHistory11111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'stakeHistory',
                                        },
                                        program: 'sysvar',
                                        space: 16392n,
                                    },
                                    executable: false,
                                    lamports: 114979200n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 16392n,
                                },
                                pubkey: 'SysvarStakeHistory1111111111111111111111111',
                            },
                        ]),
                    );
                });

                it('returns parsed JSON data for Vote account', async () => {
                    expect.assertions(1);
                    const validatorAddress = await getNodeAddress(validatorKeypairPath);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // See scripts/fixtures/vote-account.json
                    const program =
                        'Vote111111111111111111111111111111111111111' as Address<'Vote111111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: false,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual(
                        // We can't guarantee ordering is preserved across test runs
                        expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            // FIXME: We don't do a strict match here because `rootSlot` can sometimes be `null`
                                            //        Install a matcher that can match 'BigInt OR null'. None of the builtins can.
                                            info: expect.objectContaining({
                                                authorizedVoters: expect.arrayContaining([
                                                    {
                                                        authorizedVoter: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                        epoch: expect.any(BigInt), // Changes
                                                    },
                                                ]),
                                                authorizedWithdrawer: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                commission: 50,
                                                epochCredits: expect.any(Array), // Huge, changes
                                                lastTimestamp: {
                                                    slot: expect.any(BigInt),
                                                    timestamp: expect.any(BigInt),
                                                },
                                                nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                priorVoters: expect.any(Array), // Huge, changes
                                                // Note: `rootSlot` can be null in early test validator startup. Omitting
                                                votes: expect.any(Array), // Huge, changes
                                            }),
                                            type: 'vote',
                                        },
                                        program: 'vote',
                                        space: 3762n,
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Vote111111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 3762n,
                                },
                                pubkey: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                            },
                            // Local Validator
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            // FIXME: We don't do a strict match here because `rootSlot` can sometimes be `null`
                                            //        Install a matcher that can match 'BigInt OR null'. None of the builtins can.
                                            info: expect.objectContaining({
                                                authorizedVoters: expect.arrayContaining([
                                                    {
                                                        authorizedVoter: voteAccountAddress,
                                                        epoch: expect.any(BigInt), // Changes
                                                    },
                                                ]),
                                                authorizedWithdrawer: voteAccountAddress,
                                                commission: 0,
                                                epochCredits: expect.any(Array), // Huge, changes
                                                lastTimestamp: {
                                                    slot: expect.any(BigInt),
                                                    timestamp: expect.any(BigInt),
                                                },
                                                nodePubkey: validatorAddress,
                                                priorVoters: expect.any(Array), // Huge, changes
                                                // Note: `rootSlot` can be null in early test validator startup. Omitting
                                                votes: expect.any(Array), // Huge, changes
                                            }),
                                            type: 'vote',
                                        },
                                        program: 'vote',
                                        space: 3762n,
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Vote111111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 3762n,
                                },
                                pubkey: voteAccountAddress,
                            },
                        ]),
                    );
                });
            });

            describe('when called with withContext true', () => {
                it('returns RPC response with parsed JSON data for AddressLookupTable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/address-lookup-table-account.json
                    const program =
                        'AddressLookupTab1e1111111111111111111111111' as Address<'AddressLookupTab1e1111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 1304n,
                                },
                                pubkey: '2JPQuT3dHtPjrdcbUQyrrT4XYRYaWpWfmAJ54SUapg6n',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for BpfLoaderUpgradeable account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/bpf-upgradeable-loader-program-account.json
                    const program =
                        'BPFLoaderUpgradeab1e11111111111111111111111' as Address<'BPFLoaderUpgradeab1e11111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                // Token 2022 data account
                                                programData: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                                            },
                                            type: 'program',
                                        },
                                        program: 'bpf-upgradeable-loader',
                                        space: 36n,
                                    },
                                    executable: true,
                                    lamports: 1141440n,
                                    owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 36n,
                                },
                                pubkey: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 36n,
                                },
                                pubkey: 'AfFRmCFz8yUWzug2jiRc13xEEzBwyxxYSRGVE5uQMpHk',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object), // Huge
                                            type: 'programData',
                                        },
                                        program: 'bpf-upgradeable-loader',
                                        space: expect.any(BigInt),
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt),
                                    owner: 'BPFLoaderUpgradeab1e11111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: expect.any(BigInt),
                                },
                                // Token 2022 data account
                                pubkey: 'DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Config stake and validator accounts', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/config-stake-account.json
                    // See scripts/fixtures/config-validator-account.json
                    const publicKey =
                        'Config1111111111111111111111111111111111111' as Address<'Config1111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(publicKey, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 10n,
                                },
                                pubkey: 'StakeConfig11111111111111111111111111111111',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 643n,
                                },
                                pubkey: 'FtLZBmDW4Y6WNTYYZv9AcC2nQupDMDzX5Q5mp5MLpmdY',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Nonce account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/nonce-account.json
                    const program = '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    // Too large to try to match all accounts owned by system program
                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 80n,
                                },
                                pubkey: 'AiZExP8mK4RxDozh4r57knvqSZgkz86HrzPAMx61XMqU',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for accounts owned by SPL Token', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-account.json
                    // See scripts/fixtures/spl-token-account-account.json
                    // See scripts/fixtures/spl-token-multisig-account.json
                    const program =
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: null,
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 1000000000n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: 1n,
                                    space: 82n,
                                },
                                pubkey: 'So11111111111111111111111111111111111111112',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 10290815n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '1000000000000',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 10290815n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 355n,
                                },
                                pubkey: '4Uh9vK5nnxfskc73asy7AeRYDfZocrv1th9DEjtdCn88',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                delegate: 'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL',
                                                delegatedAmount: {
                                                    amount: '100000000000',
                                                    decimals: 9,
                                                    uiAmount: 100,
                                                    uiAmountString: '100',
                                                },
                                                isNative: false,
                                                mint: '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M',
                                                owner: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: '1000000000000',
                                                    decimals: 9,
                                                    uiAmount: 1000,
                                                    uiAmountString: '1000',
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca',
                            },
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                isNative: false,
                                                mint: '2nBoNW5B9SdpJYEg9neii7ecCJFwh6UrbXS6HFxkK7Gf',
                                                owner: 'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL',
                                                state: 'initialized',
                                                tokenAmount: {
                                                    amount: '0',
                                                    decimals: 9,
                                                    uiAmount: 0,
                                                    uiAmountString: '0',
                                                },
                                            },
                                            type: 'account',
                                        },
                                        program: 'spl-token',
                                        space: 165n,
                                    },
                                    executable: false,
                                    lamports: 2039280n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 165n,
                                },
                                pubkey: 'GoJdqNkvpf26BAX8cYsV3bb52kbBYt7vT5rqpPGGgK5F',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                decimals: 9,
                                                freezeAuthority: null,
                                                isInitialized: true,
                                                mintAuthority: '3xxDCjN8s6MgNHwdRExRLa6gHmmRTWPnUdzkbKfEgNAe',
                                                supply: '0',
                                            },
                                            type: 'mint',
                                        },
                                        program: 'spl-token',
                                        space: 82n,
                                    },
                                    executable: false,
                                    lamports: 1461600n,
                                    owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    rentEpoch: expect.any(BigInt),
                                    space: 82n,
                                },
                                pubkey: 'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for SPL Token 22 mint account', async () => {
                    expect.assertions(1);
                    // See scripts/fixtures/spl-token-22-mint-account.json
                    const program =
                        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
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
                                    rentEpoch: expect.any(BigInt),
                                    space: 278n,
                                },
                                pubkey: 'CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Stake account', async () => {
                    expect.assertions(1);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // TODO: Test validator does not write this keypair to JSON
                    // See solana-labs/solana/pull/33014
                    const stakeAddress = expect.any(String);
                    // See scripts/fixtures/stake-account.json
                    const program =
                        'Stake11111111111111111111111111111111111111' as Address<'Stake11111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            // Local Validator
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: {
                                                meta: {
                                                    authorized: {
                                                        staker: stakeAddress,
                                                        withdrawer: stakeAddress,
                                                    },
                                                    lockup: {
                                                        custodian: '11111111111111111111111111111111',
                                                        epoch: 0n,
                                                        unixTimestamp: 0n,
                                                    },
                                                    rentExemptReserve: '2282880',
                                                },
                                                stake: {
                                                    creditsObserved: expect.any(BigInt), // Changes
                                                    delegation: {
                                                        activationEpoch: expect.any(String), // Changes
                                                        deactivationEpoch: expect.any(String), // Changes
                                                        stake: expect.any(String), // Changes
                                                        voter: voteAccountAddress,
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
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Stake11111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 200n,
                                },
                                pubkey: stakeAddress,
                            },
                            // Fixture
                            {
                                account: {
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
                                                    creditsObserved: expect.any(BigInt), // Changes
                                                    delegation: {
                                                        activationEpoch: expect.any(String), // Changes
                                                        deactivationEpoch: expect.any(String), // Changes
                                                        stake: expect.any(String), // Changes
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
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Stake11111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 200n,
                                },
                                pubkey: 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Sysvar rent account', async () => {
                    expect.assertions(1);
                    // Sysvar accounts don't need a fixture
                    // They're owned by Sysvar1111111111111111111111111111111111111
                    const program =
                        'Sysvar1111111111111111111111111111111111111' as Address<'Sysvar1111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'clock',
                                        },
                                        program: 'sysvar',
                                        space: 40n,
                                    },
                                    executable: false,
                                    lamports: 1169280n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 40n,
                                },
                                pubkey: 'SysvarC1ock11111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'epochSchedule',
                                        },
                                        program: 'sysvar',
                                        space: 33n,
                                    },
                                    executable: false,
                                    lamports: 1120560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 33n,
                                },
                                pubkey: 'SysvarEpochSchedu1e111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'fees',
                                        },
                                        program: 'sysvar',
                                        space: 8n,
                                    },
                                    executable: false,
                                    lamports: 946560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 8n,
                                },
                                pubkey: 'SysvarFees111111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'recentBlockhashes',
                                        },
                                        program: 'sysvar',
                                        space: 6008n,
                                    },
                                    executable: false,
                                    lamports: 42706560n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 6008n,
                                },
                                pubkey: 'SysvarRecentB1ockHashes11111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'rent',
                                        },
                                        program: 'sysvar',
                                        space: 17n,
                                    },
                                    executable: false,
                                    lamports: 1009200n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 17n,
                                },
                                pubkey: 'SysvarRent111111111111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'slotHistory',
                                        },
                                        program: 'sysvar',
                                        space: 131097n,
                                    },
                                    executable: false,
                                    lamports: 913326000n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 131097n,
                                },
                                pubkey: 'SysvarS1otHistory11111111111111111111111111',
                            },
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            info: expect.any(Object),
                                            type: 'stakeHistory',
                                        },
                                        program: 'sysvar',
                                        space: 16392n,
                                    },
                                    executable: false,
                                    lamports: 114979200n,
                                    owner: 'Sysvar1111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 16392n,
                                },
                                pubkey: 'SysvarStakeHistory1111111111111111111111111',
                            },
                        ]),
                    });
                });

                it('returns RPC response with parsed JSON data for Vote account', async () => {
                    expect.assertions(1);
                    const validatorAddress = await getNodeAddress(validatorKeypairPath);
                    const voteAccountAddress = await getNodeAddress(voteAccountKeypairPath);
                    // See scripts/fixtures/vote-account.json
                    const program =
                        'Vote111111111111111111111111111111111111111' as Address<'Vote111111111111111111111111111111111111111'>;

                    const accountInfosPromise = rpc
                        .getProgramAccounts(program, {
                            encoding: 'jsonParsed',
                            withContext: true,
                        })
                        .send();

                    await expect(accountInfosPromise).resolves.toStrictEqual({
                        context: CONTEXT_MATCHER,
                        // We can't guarantee ordering is preserved across test runs
                        value: expect.arrayContaining([
                            // Fixture
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            // FIXME: We don't do a strict match here because `rootSlot` can sometimes be `null`
                                            //        Install a matcher that can match 'BigInt OR null'. None of the builtins can.
                                            info: expect.objectContaining({
                                                authorizedVoters: expect.arrayContaining([
                                                    {
                                                        authorizedVoter: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                        epoch: expect.any(BigInt), // Changes
                                                    },
                                                ]),
                                                authorizedWithdrawer: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                commission: 50,
                                                epochCredits: expect.any(Array), // Huge, changes
                                                lastTimestamp: {
                                                    slot: expect.any(BigInt),
                                                    timestamp: expect.any(BigInt),
                                                },
                                                nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr',
                                                priorVoters: expect.any(Array), // Huge, changes
                                                // Note: `rootSlot` can be null in early test validator startup. Omitting
                                                votes: expect.any(Array), // Huge, changes
                                            }),
                                            type: 'vote',
                                        },
                                        program: 'vote',
                                        space: 3762n,
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Vote111111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 3762n,
                                },
                                pubkey: '4QUZQ4c7bZuJ4o4L8tYAEGnePFV27SUFEVmC7BYfsXRp',
                            },
                            // Local Validator
                            {
                                account: {
                                    data: {
                                        parsed: {
                                            // FIXME: We don't do a strict match here because `rootSlot` can sometimes be `null`
                                            //        Install a matcher that can match 'BigInt OR null'. None of the builtins can.
                                            info: expect.objectContaining({
                                                authorizedVoters: expect.arrayContaining([
                                                    {
                                                        authorizedVoter: voteAccountAddress,
                                                        epoch: expect.any(BigInt), // Changes
                                                    },
                                                ]),
                                                authorizedWithdrawer: voteAccountAddress,
                                                commission: 0,
                                                epochCredits: expect.any(Array), // Huge, changes
                                                lastTimestamp: {
                                                    slot: expect.any(BigInt),
                                                    timestamp: expect.any(BigInt),
                                                },
                                                nodePubkey: validatorAddress,
                                                priorVoters: expect.any(Array), // Huge, changes
                                                // Note: `rootSlot` can be null in early test validator startup. Omitting
                                                votes: expect.any(Array), // Huge, changes
                                            }),
                                            type: 'vote',
                                        },
                                        program: 'vote',
                                        space: 3762n,
                                    },
                                    executable: false,
                                    lamports: expect.any(BigInt), // Changes
                                    owner: 'Vote111111111111111111111111111111111111111',
                                    rentEpoch: expect.any(BigInt),
                                    space: 3762n,
                                },
                                pubkey: voteAccountAddress,
                            },
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
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
                'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' as Address<'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj'>;

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
