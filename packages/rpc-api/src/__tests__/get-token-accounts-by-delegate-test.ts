import type { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SolanaError,
} from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetTokenAccountsByDelegateApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getTokenAccountsByDelegate', () => {
    let rpc: Rpc<GetTokenAccountsByDelegateApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns RPC response with account info', async () => {
                expect.assertions(1);
                // Delegate for fixtures/spl-token-token-account-delegated.json
                const delegate =
                    'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

                // token program for above delegated token account
                const tokenProgram =
                    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                const accountInfosPromise = rpc
                    .getTokenAccountsByDelegate(
                        delegate,
                        { programId: tokenProgram },
                        {
                            commitment,
                            encoding: 'base64',
                        },
                    )
                    .send();

                await expect(accountInfosPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: [
                        {
                            account: {
                                data: [
                                    'MzQJGAUaL2fumioXGww9PVOXgMEaYSUPr/X0cUZdeAYsDL6z1hknAtbDjgZSI7IFX/T4ppGnUviTNyfH5/mUSwAQpdToAAAAAQAAAN++YxbNiIWM+zxxHYuV2FyrImZH2l93yTIUPo7gDw6JAQAAAAAAAAAAAAAAAADodkgXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                    'base64',
                                ],
                                executable: false,
                                lamports: 10290815n,
                                owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                rentEpoch: 0n,
                                space: 165n,
                            },
                            pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                        },
                    ],
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws a slot not reached error', async () => {
            expect.assertions(3);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // token program for above delegated token account
            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    },
                )
                .send();
            await Promise.all([
                expect(accountInfoPromise).rejects.toThrow(SolanaError),
                expect(accountInfoPromise).rejects.toHaveProperty(
                    'context.__code',
                    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
                ),
                expect(accountInfoPromise).rejects.toHaveProperty('context.contextSlot', expect.any(Number)),
            ]);
        });
    });

    describe('when called with a delegate with no accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // randomly generated
            const delegate =
                'AUbvs341pr8rvpUaDBjpxhH9sg62eVsaMTV6vHoz4iJF' as Address<'AUbvs341pr8rvpUaDBjpxhH9sg62eVsaMTV6vHoz4iJF'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId: tokenProgram }).send();
            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with a mint that does not exist', () => {
        it('throws an error for mint not existing', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const mint =
                'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4' as Address<'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { mint }).send();
            await expect(accountInfoPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid param: could not find mint',
                }),
            );
        });
    });

    describe('when called with a mint that has a delegated token account', () => {
        it('returns RPC response with account info', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-account-with-delegated.json (mint for above delegated account)
            const mint =
                '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M' as Address<'4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { mint },
                    {
                        encoding: 'base64',
                    },
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'MzQJGAUaL2fumioXGww9PVOXgMEaYSUPr/X0cUZdeAYsDL6z1hknAtbDjgZSI7IFX/T4ppGnUviTNyfH5/mUSwAQpdToAAAAAQAAAN++YxbNiIWM+zxxHYuV2FyrImZH2l93yTIUPo7gDw6JAQAAAAAAAAAAAAAAAADodkgXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                'base64',
                            ],
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                    },
                ],
            });
        });
    });

    describe('when called with a mint that has no delegated token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-no-token-accounts.json (not the same mint as above delegated account)
            const mint =
                'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj' as Address<'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { mint }).send();

            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with a program that is not a Token program', () => {
        it('throws an error for unrecognized program', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const programId =
                'HFnhCvdV9yyShcFNQvdR5LazsKXpnJNxwoRKjE9V1LrF' as Address<'HFnhCvdV9yyShcFNQvdR5LazsKXpnJNxwoRKjE9V1LrF'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId }).send();
            await expect(accountInfoPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid param: unrecognized Token program id',
                }),
            );
        });
    });

    describe('when called with a program that has no delegated token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Token22 program (not the same as above delegated account fixture)
            const programId =
                'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId }).send();

            await expect(accountInfoPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [],
            });
        });
    });

    describe('when called with base58 encoding', () => {
        // Currently we can't test this because every token account is >128 bytes
        // The solana source only allows base58 encoding up to 128 bytes: https://github.com/solana-labs/solana/blob/master/account-decoder/src/lib.rs#L37
        it.todo('returns RPC Response with account info with annotated base58 encoding');
    });

    describe('when called with base64 encoding', () => {
        it('returns RPC Response with account info with annotated base64 encoding', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64',
                    },
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'MzQJGAUaL2fumioXGww9PVOXgMEaYSUPr/X0cUZdeAYsDL6z1hknAtbDjgZSI7IFX/T4ppGnUviTNyfH5/mUSwAQpdToAAAAAQAAAN++YxbNiIWM+zxxHYuV2FyrImZH2l93yTIUPo7gDw6JAQAAAAAAAAAAAAAAAADodkgXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                'base64',
                            ],
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                    },
                ],
            });
        });
    });

    describe('when called with base64+zstd encoding', () => {
        it('returns RPC Response with account info with annotated base64+zstd encoding', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64+zstd',
                    },
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
                    {
                        account: {
                            data: [
                                'KLUv/QBY5QMANAczNAkYBRovZ+6aKhcbDD09U5eAwRphJQ+v9fRxRl14BiwMvrPWGScC1sOOBlIjsgVf9PimkadS+JM3J8fn+ZRLABCl1OgAAAABAAAA375jFs2IhYz7PHEdi5XYXKsiZkfaX3fJMhQ+juAPDokBAOh2SBcAAgDBoy4Hzg==',
                                'base64+zstd',
                            ],
                            executable: false,
                            lamports: 10290815n,
                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                    },
                ],
            });
        });
    });

    describe('when called with jsonParsed encoding', () => {
        it('returns RPC response with parsed JSON data for SPL Token token account', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfosPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'jsonParsed',
                    },
                )
                .send();

            await expect(accountInfosPromise).resolves.toStrictEqual({
                context: CONTEXT_MATCHER,
                value: [
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
                            rentEpoch: 0n,
                            space: 165n,
                        },
                        pubkey: '6uGCrvzPAta1nc6wP9oHvM6sRDu1kXTMuJSJvro4R4xS',
                    },
                ],
            });
        });
    });

    describe('when called with no encoding', () => {
        // Currently we can't test this because every token account is >128 bytes
        // The solana source only allows base58 encoding up to 128 bytes: https://github.com/solana-labs/solana/blob/master/account-decoder/src/lib.rs#L37
        it.todo('returns base58 data without an annotation');
    });

    describe('when called with a dataSlice', () => {
        it('returns the slice of the data', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Address<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfo = await rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    },
                )
                .send();

            expect(accountInfo.value[0].account.data[0].length).toBeLessThan(20);
        });
    });
});
