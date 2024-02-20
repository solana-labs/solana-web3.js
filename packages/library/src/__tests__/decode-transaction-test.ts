import { FetchAccountsConfig, fetchJsonParsedAccounts } from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import type { Blockhash, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import { decompileTransaction, getCompiledTransactionDecoder } from '@solana/transactions';
import type { CompiledTransaction } from '@solana/transactions/dist/types/compile-transaction';

jest.mock('@solana/accounts');
jest.mock('@solana/transactions');

describe('decodeTransaction', () => {
    const blockhash = 'abc' as Blockhash;
    const encodedTransaction = new Uint8Array([1, 2, 3]);
    const rpc: Rpc<GetMultipleAccountsApi> = {
        getMultipleAccounts: jest.fn(),
    };

    // Reload `decodeTransaction` before each test to reset memoized state
    let decodeTransaction: typeof import('../decode-transaction').decodeTransaction;
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const decodeTransactionModule =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../decode-transaction');
            decodeTransaction = (await decodeTransactionModule).decodeTransaction;
        });

        jest.clearAllMocks();
    });

    describe('for a legacy transaction', () => {
        const compiledTransaction: CompiledTransaction = {
            compiledMessage: {
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
            },
            signatures: [],
        };

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);
        });

        it('should pass the given encoded transaction to the compiled transaction decoder', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockCompiledTransactionDecode).toHaveBeenCalledWith(encodedTransaction);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransaction` with the compiled transaction and no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(decompileTransaction).toHaveBeenCalledWith(compiledTransaction, {
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });

        it('should pass `lastValidBlockHeight` to `decompileTransaction`', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc, { lastValidBlockHeight: 100n });
            expect(decompileTransaction).toHaveBeenCalledWith(compiledTransaction, {
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: 100n,
            });
        });
    });

    describe('for a versioned transaction with no `addressTableLookups` field', () => {
        const compiledTransaction: CompiledTransaction = {
            compiledMessage: {
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
            },
            signatures: [],
        };

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);
        });

        it('should pass the given encoded transaction to the compiled transaction decoder', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockCompiledTransactionDecode).toHaveBeenCalledWith(encodedTransaction);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransaction` with the compiled transaction and no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(decompileTransaction).toHaveBeenCalledWith(compiledTransaction, {
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });
    });

    describe('for a versioned transaction with empty `addressTableLookups`', () => {
        const compiledTransaction: CompiledTransaction = {
            compiledMessage: {
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
            },
            signatures: [],
        };

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);
        });

        it('should pass the given encoded transaction to the compiled transaction decoder', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockCompiledTransactionDecode).toHaveBeenCalledWith(encodedTransaction);
        });

        it('should not call the `fetchJsonParsedAccounts` function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(fetchJsonParsedAccounts).not.toHaveBeenCalled();
        });

        it('should call `decompileTransaction` with the compiled transaction and no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(decompileTransaction).toHaveBeenCalledWith(compiledTransaction, {
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });
    });

    describe('for a versioned transaction with non-empty `addressTableLookups`', () => {
        const lookupTableAddress1 = '1111' as Address;
        const lookupTableAddress2 = '2222' as Address;

        const compiledTransaction: CompiledTransaction = {
            compiledMessage: {
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
            },
            signatures: [],
        };

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
                lamports: 0n as LamportsUnsafeBeyond2Pow53Minus1,
                programAddress: 'program' as Address,
            },
            {
                address: lookupTableAddress2,
                data: {
                    addresses: [addressInLookup2],
                },
                executable: false,
                exists: true,
                lamports: 0n as LamportsUnsafeBeyond2Pow53Minus1,
                programAddress: 'program' as Address,
            },
        ];

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);

            // mock `fetchJsonParsedAccounts` to resolve to `fetchedLookupTables`
            jest.mocked(fetchJsonParsedAccounts).mockResolvedValue(fetchedLookupTables);
        });

        it('should pass the given encoded transaction to the compiled transaction decoder', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockCompiledTransactionDecode).toHaveBeenCalledWith(encodedTransaction);
        });

        it('should call the `fetchJsonParsedAccounts` function with the lookup table addresses', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(fetchJsonParsedAccounts).toHaveBeenCalledWith(rpc, [lookupTableAddress1, lookupTableAddress2], {});
        });

        it('should pass config to `fetchJsonParsedAccounts`', async () => {
            expect.assertions(1);
            const fetchAccountsConfig: FetchAccountsConfig = {
                abortSignal: new AbortController().signal,
                commitment: 'confirmed',
                minContextSlot: 100n,
            };
            await decodeTransaction(encodedTransaction, rpc, {
                ...fetchAccountsConfig,
                lastValidBlockHeight: 100n,
            });
            expect(fetchJsonParsedAccounts).toHaveBeenCalledWith(
                rpc,
                [lookupTableAddress1, lookupTableAddress2],
                fetchAccountsConfig,
            );
        });

        it('should call `decompileTransaction` with the compiled transaction and the fetched lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(decompileTransaction).toHaveBeenCalledWith(compiledTransaction, {
                addressesByLookupTableAddress: {
                    [lookupTableAddress1]: [addressInLookup1],
                    [lookupTableAddress2]: [addressInLookup2],
                },
                lastValidBlockHeight: undefined,
            });
        });
    });
});
