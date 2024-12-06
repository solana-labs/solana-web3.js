import { FetchAccountsConfig, fetchJsonParsedAccounts } from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import type { Blockhash, Lamports } from '@solana/rpc-types';
import {
    CompiledTransactionMessage,
    decompileTransactionMessage,
    TransactionMessage,
} from '@solana/transaction-messages';

import { decompileTransactionMessageFetchingLookupTables } from '../decompile-transaction-message-fetching-lookup-tables';

jest.mock('@solana/accounts');
jest.mock('@solana/transaction-messages');

describe('decompileTransactionMessageFetchingLookupTables', () => {
    const blockhash = 'abc' as Blockhash;
    const rpc: Rpc<GetMultipleAccountsApi> = {
        getMultipleAccounts: jest.fn(),
    };

    describe('for a legacy transaction', () => {
        const compiledTransactionMessage: CompiledTransactionMessage = {
            // no `addressTableLookups` field
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 0,
                numSignerAccounts: 0,
            },
            instructions: [],
            lifetimeToken: blockhash,
            staticAccounts: [],
            version: 'legacy',
        };

        const transactionMessage = { version: 'legacy' } as unknown as TransactionMessage;

        beforeEach(() => {
            (decompileTransactionMessage as jest.Mock).mockReturnValue(transactionMessage);
            // reset mock calls
            jest.clearAllMocks();
        });

        it('should return the result of `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await expect(
                decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc),
            ).resolves.toStrictEqual(transactionMessage);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransactionMessage` with the input transaction', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                compiledTransactionMessage,
                expect.any(Object), // config
            );
        });

        it('should call the `decompileTransactionMessage` with no lookup tables', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    addressesByLookupTableAddress: {},
                }),
            );
        });

        it('should pass `lastValidBlockHeight` to `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc, {
                lastValidBlockHeight: 100n,
            });
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    lastValidBlockHeight: 100n,
                }),
            );
        });
    });

    describe('for a versioned transaction with no `addressTableLookups` field', () => {
        const compiledTransactionMessage: CompiledTransactionMessage = {
            // no `addressTableLookups` field
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 0,
                numSignerAccounts: 0,
            },
            instructions: [],
            lifetimeToken: blockhash,
            staticAccounts: [],
            version: 0,
        };

        const transactionMessage = { version: 0 } as unknown as TransactionMessage;

        beforeEach(() => {
            (decompileTransactionMessage as jest.Mock).mockReturnValue(transactionMessage);
            // reset mock calls
            jest.clearAllMocks();
        });

        it('should return the result of `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await expect(
                decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc),
            ).resolves.toStrictEqual(transactionMessage);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransactionMessage` with the input transaction', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                compiledTransactionMessage,
                expect.any(Object), // config
            );
        });

        it('should call `decompileTransactionMessage` with no lookup tables', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    addressesByLookupTableAddress: {},
                }),
            );
        });

        it('should pass `lastValidBlockHeight` to `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc, {
                lastValidBlockHeight: 100n,
            });
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    lastValidBlockHeight: 100n,
                }),
            );
        });
    });

    describe('for a versioned transaction with empty `addressTableLookups`', () => {
        const compiledTransactionMessage: CompiledTransactionMessage = {
            addressTableLookups: [],
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 0,
                numSignerAccounts: 0,
            },
            instructions: [],
            lifetimeToken: blockhash,
            staticAccounts: [],
            version: 0,
        };

        const transactionMessage = { version: 0 } as unknown as TransactionMessage;

        beforeEach(() => {
            (decompileTransactionMessage as jest.Mock).mockReturnValue(transactionMessage);
            // reset mock calls
            jest.clearAllMocks();
        });

        it('should return the result of `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await expect(
                decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc),
            ).resolves.toStrictEqual(transactionMessage);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransactionMessage` with the input transaction', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                compiledTransactionMessage,
                expect.any(Object), // config
            );
        });

        it('should call `decompileTransactionMessage` with no lookup tables', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    addressesByLookupTableAddress: {},
                }),
            );
        });

        it('should pass `lastValidBlockHeight` to `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc, {
                lastValidBlockHeight: 100n,
            });
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    lastValidBlockHeight: 100n,
                }),
            );
        });
    });

    describe('for a versioned transaction with non-empty `addressTableLookups`', () => {
        const lookupTableAddress1 = '1111' as Address;
        const lookupTableAddress2 = '2222' as Address;

        const compiledTransactionMessage: CompiledTransactionMessage = {
            addressTableLookups: [
                {
                    lookupTableAddress: lookupTableAddress1,
                    readableIndices: [0],
                    writableIndices: [],
                },
                {
                    lookupTableAddress: lookupTableAddress2,
                    readableIndices: [0],
                    writableIndices: [],
                },
            ],
            header: {
                numReadonlyNonSignerAccounts: 0,
                numReadonlySignerAccounts: 0,
                numSignerAccounts: 0,
            },
            instructions: [],
            lifetimeToken: blockhash,
            staticAccounts: [],
            version: 0,
        };

        const transactionMessage = { version: 0 } as unknown as TransactionMessage;

        const addressInLookup1 = '3333' as Address;
        const addressInLookup2 = '4444' as Address;

        const fetchedLookupTables: Awaited<ReturnType<typeof fetchJsonParsedAccounts>> = [
            {
                address: lookupTableAddress1,
                data: {
                    addresses: [addressInLookup1],
                },
                executable: false,
                exists: true,
                lamports: 0n as Lamports,
                programAddress: 'program' as Address,
                space: 0n,
            },
            {
                address: lookupTableAddress2,
                data: {
                    addresses: [addressInLookup2],
                },
                executable: false,
                exists: true,
                lamports: 0n as Lamports,
                programAddress: 'program' as Address,
                space: 0n,
            },
        ];

        beforeEach(() => {
            (decompileTransactionMessage as jest.Mock).mockReturnValue(transactionMessage);
            (fetchJsonParsedAccounts as jest.Mock).mockResolvedValue(fetchedLookupTables);

            // reset mock calls
            jest.clearAllMocks();
        });

        it('should return the result of `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await expect(
                decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc),
            ).resolves.toStrictEqual(transactionMessage);
        });

        it('should call `fetchJsonParsedAccounts` with the lookup table addresses', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(fetchJsonParsedAccounts).toHaveBeenCalledWith(rpc, [lookupTableAddress1, lookupTableAddress2], {});
        });

        it('should pass config to `fetchJsonParsedAccounts`', async () => {
            expect.assertions(1);
            const fetchAccountsConfig: FetchAccountsConfig = {
                abortSignal: new AbortController().signal,
                commitment: 'confirmed',
                minContextSlot: 100n,
            };
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc, {
                ...fetchAccountsConfig,
                lastValidBlockHeight: 100n,
            });
            expect(fetchJsonParsedAccounts).toHaveBeenCalledWith(
                rpc,
                [lookupTableAddress1, lookupTableAddress2],
                fetchAccountsConfig,
            );
        });

        it('should call `decompileTransactionMessage` with the input transaction', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                compiledTransactionMessage,
                expect.any(Object), // config
            );
        });

        it('should call `decompileTransactionMessage` with the addresses from the lookup tables', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    addressesByLookupTableAddress: {
                        [lookupTableAddress1]: [addressInLookup1],
                        [lookupTableAddress2]: [addressInLookup2],
                    },
                }),
            );
        });

        it('should pass `lastValidBlockHeight` to `decompileTransactionMessage`', async () => {
            expect.assertions(1);
            await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc, {
                lastValidBlockHeight: 100n,
            });
            expect(decompileTransactionMessage).toHaveBeenCalledWith(
                expect.any(Object), // transaction
                expect.objectContaining({
                    lastValidBlockHeight: 100n,
                }),
            );
        });
    });
});
