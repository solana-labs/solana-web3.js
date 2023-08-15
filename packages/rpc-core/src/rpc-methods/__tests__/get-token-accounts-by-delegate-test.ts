import { Base58EncodedAddress } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment } from '../common';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getTokenAccountsByDelegate', () => {
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
            it('returns RPC response with account info', async () => {
                expect.assertions(1);
                // Delegate for fixtures/spl-token-token-account-delegated.json
                const delegate =
                    'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

                // token program for above delegated token account
                const tokenProgram =
                    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

                const accountInfoPromise = rpc
                    .getTokenAccountsByDelegate(
                        delegate,
                        { programId: tokenProgram },
                        {
                            commitment,
                            encoding: 'base64',
                        }
                    )
                    .send();

                await expect(accountInfoPromise).resolves.toMatchObject({
                    context: expect.objectContaining({
                        slot: expect.any(BigInt),
                    }),
                    value: [
                        {
                            account: {
                                data: [expect.any(String), 'base64'],
                                executable: expect.any(Boolean),
                                lamports: expect.any(BigInt),
                                owner: expect.any(String),
                                rentEpoch: expect.any(BigInt),
                                space: expect.any(BigInt),
                            },
                            pubkey: expect.any(String),
                        },
                    ],
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws a slot not reached error', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // token program for above delegated token account
            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    }
                )
                .send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a delegate with no accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // randomly generated
            const delegate =
                'AUbvs341pr8rvpUaDBjpxhH9sg62eVsaMTV6vHoz4iJF' as Base58EncodedAddress<'AUbvs341pr8rvpUaDBjpxhH9sg62eVsaMTV6vHoz4iJF'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId: tokenProgram }).send();
            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [],
            });
        });
    });

    describe('when called with a mint that does not exist', () => {
        it('throws an error for mint not existing', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const mint =
                'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4' as Base58EncodedAddress<'bYaTaiLtMmTfqZaVbo2rwQrdj1iA2DdjMrSACLCSZj4'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { mint }).send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a mint that has a delegated token account', () => {
        it('returns RPC response with account info', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-account-with-delegated.json (mint for above delegated account)
            const mint =
                '4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M' as Base58EncodedAddress<'4SspA9vWmizwcvngHTapwQtpnRrPf8V483giCSaCmy6M'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { mint },
                    {
                        encoding: 'base64',
                    }
                )
                .send();

            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [
                    expect.objectContaining({
                        account: expect.objectContaining({
                            data: [expect.any(String), 'base64'],
                            executable: expect.any(Boolean),
                            lamports: expect.any(BigInt),
                            owner: expect.any(String),
                            rentEpoch: expect.any(BigInt),
                            space: expect.any(BigInt),
                        }),
                    }),
                ],
            });
        });
    });

    describe('when called with a mint that has no delegated token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Mint at fixtures/spl-token-mint-no-token-accounts.json (not the same mint as above delegated account)
            const mint =
                'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj' as Base58EncodedAddress<'HWHfrWotTpaNArteqeYDziV1ZX9Lm7WV684NeUCwPPzj'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { mint }).send();

            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [],
            });
        });
    });

    describe('when called with a program that is not a Token program', () => {
        it('throws an error for unrecognized program', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // randomly generated
            const programId =
                'HFnhCvdV9yyShcFNQvdR5LazsKXpnJNxwoRKjE9V1LrF' as Base58EncodedAddress<'HFnhCvdV9yyShcFNQvdR5LazsKXpnJNxwoRKjE9V1LrF'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId }).send();
            await expect(accountInfoPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a program that has no delegated token accounts', () => {
        it('returns an empty list', async () => {
            expect.assertions(1);
            // Delegate for fixtures/spl-token-token-account-delegated.json
            const delegate =
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            // Token22 program (not the same as above delegated account fixture)
            const programId =
                'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Base58EncodedAddress<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;

            const accountInfoPromise = rpc.getTokenAccountsByDelegate(delegate, { programId }).send();

            await expect(accountInfoPromise).resolves.toMatchObject({
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
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64',
                    }
                )
                .send();

            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [
                    {
                        account: expect.objectContaining({
                            data: [expect.any(String), 'base64'],
                        }),
                        pubkey: expect.any(String),
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
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'base64+zstd',
                    }
                )
                .send();

            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [
                    {
                        account: expect.objectContaining({
                            data: [expect.any(String), 'base64+zstd'],
                        }),
                        pubkey: expect.any(String),
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
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfoPromise = rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        encoding: 'jsonParsed',
                    }
                )
                .send();

            await expect(accountInfoPromise).resolves.toMatchObject({
                value: [
                    {
                        account: expect.objectContaining({
                            data: {
                                parsed: {
                                    info: expect.objectContaining({
                                        delegate,
                                        delegatedAmount: {
                                            amount: expect.any(String),
                                            decimals: expect.any(Number),
                                            uiAmount: expect.any(Number),
                                            uiAmountString: expect.any(String),
                                        },
                                        isNative: expect.any(Boolean),
                                        mint: expect.any(String),
                                        owner: expect.any(String),
                                        state: expect.any(String),
                                        tokenAmount: {
                                            amount: expect.any(String),
                                            decimals: expect.any(Number),
                                            uiAmount: expect.any(Number),
                                            uiAmountString: expect.any(String),
                                        },
                                    }),
                                    type: 'account',
                                },
                                program: 'spl-token',
                                space: 165n,
                            },
                        }),
                        pubkey: expect.any(String),
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
                'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL' as Base58EncodedAddress<'G4QJANEpvEN8vLaaMZoWwZtqHfWxuWpd5RrVVYXPCgeL'>;

            const tokenProgram =
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Base58EncodedAddress<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;

            const accountInfo = await rpc
                .getTokenAccountsByDelegate(
                    delegate,
                    { programId: tokenProgram },
                    {
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    }
                )
                .send();

            expect(accountInfo.value[0].account.data[0].length).toBeLessThan(20);
        });
    });
});
