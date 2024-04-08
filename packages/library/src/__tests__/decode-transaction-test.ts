import { FetchAccountsConfig, fetchJsonParsedAccounts } from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import type { Blockhash, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import {
    CompilableTransaction,
    getCompiledTransactionDecoder,
    getTransactionDecoder,
    ITransactionWithSignatures,
} from '@solana/transactions';
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

        const mockTransaction: CompilableTransaction = { version: 0 } as unknown as CompilableTransaction;

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        let mockTransactionDecode: () => CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures);

        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);
            mockTransactionDecode = jest.fn().mockReturnValue(mockTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);

            // mock `getTransactionDecoder`

            jest.mocked(getTransactionDecoder).mockReturnValue({
                decode: mockTransactionDecode,
            } as unknown as ReturnType<typeof getTransactionDecoder>);
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

        it('should call the transaction decoder with no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(getTransactionDecoder).toHaveBeenCalledWith({
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });

        it('should return the result of the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            const decodePromise = decodeTransaction(encodedTransaction, rpc);
            await expect(decodePromise).resolves.toStrictEqual(mockTransaction);
        });

        it('should call the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockTransactionDecode).toHaveBeenLastCalledWith(encodedTransaction);
        });

        it('should pass `lastValidBlockHeight` to `decompileTransaction`', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc, { lastValidBlockHeight: 100n });
            expect(getTransactionDecoder).toHaveBeenCalledWith({
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

        const mockTransaction: CompilableTransaction = { version: 0 } as unknown as CompilableTransaction;

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        let mockTransactionDecode: () => CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures);

        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);
            mockTransactionDecode = jest.fn().mockReturnValue(mockTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);

            // mock `getTransactionDecoder`

            jest.mocked(getTransactionDecoder).mockReturnValue({
                decode: mockTransactionDecode,
            } as unknown as ReturnType<typeof getTransactionDecoder>);
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

        it('should call the transaction decoder with no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(getTransactionDecoder).toHaveBeenCalledWith({
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });

        it('should return the result of the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            const decodePromise = decodeTransaction(encodedTransaction, rpc);
            await expect(decodePromise).resolves.toStrictEqual(mockTransaction);
        });

        it('should call the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockTransactionDecode).toHaveBeenLastCalledWith(encodedTransaction);
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

        const mockTransaction: CompilableTransaction = { version: 0 } as unknown as CompilableTransaction;

        // mock `getCompiledTransactionDecoder` to return `compiledTransaction`
        let mockCompiledTransactionDecode: () => CompiledTransaction;
        let mockTransactionDecode: () => CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures);

        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);
            mockTransactionDecode = jest.fn().mockReturnValue(mockTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);

            // mock `getTransactionDecoder`
            jest.mocked(getTransactionDecoder).mockReturnValue({
                decode: mockTransactionDecode,
            } as unknown as ReturnType<typeof getTransactionDecoder>);
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

        it('should call the transaction decoder with no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(getTransactionDecoder).toHaveBeenCalledWith({
                addressesByLookupTableAddress: {},
                lastValidBlockHeight: undefined,
            });
        });

        it('should return the result of the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            const decodePromise = decodeTransaction(encodedTransaction, rpc);
            await expect(decodePromise).resolves.toStrictEqual(mockTransaction);
        });

        it('should call the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockTransactionDecode).toHaveBeenLastCalledWith(encodedTransaction);
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

        const mockTransaction: CompilableTransaction = { version: 0 } as unknown as CompilableTransaction;

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

        let mockCompiledTransactionDecode: () => CompiledTransaction;
        let mockTransactionDecode: () => CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures);
        beforeEach(() => {
            mockCompiledTransactionDecode = jest.fn().mockReturnValue(compiledTransaction);
            mockTransactionDecode = jest.fn().mockReturnValue(mockTransaction);

            jest.mocked(getCompiledTransactionDecoder).mockReturnValue({
                decode: mockCompiledTransactionDecode,
            } as unknown as ReturnType<typeof getCompiledTransactionDecoder>);

            // mock `fetchJsonParsedAccounts` to resolve to `fetchedLookupTables`
            jest.mocked(fetchJsonParsedAccounts).mockResolvedValue(fetchedLookupTables);

            // mock `getTransactionDecoder`
            jest.mocked(getTransactionDecoder).mockReturnValue({
                decode: mockTransactionDecode,
            } as unknown as ReturnType<typeof getTransactionDecoder>);
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

        it('should call the transaction decoder with no lookup tables', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(getTransactionDecoder).toHaveBeenCalledWith({
                addressesByLookupTableAddress: {
                    [lookupTableAddress1]: [addressInLookup1],
                    [lookupTableAddress2]: [addressInLookup2],
                },
                lastValidBlockHeight: undefined,
            });
        });

        it('should return the result of the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            const decodePromise = decodeTransaction(encodedTransaction, rpc);
            await expect(decodePromise).resolves.toStrictEqual(mockTransaction);
        });

        it('should call the `getTransactionDecoder` decode function', async () => {
            expect.assertions(1);
            await decodeTransaction(encodedTransaction, rpc);
            expect(mockTransactionDecode).toHaveBeenLastCalledWith(encodedTransaction);
        });
    });
});
