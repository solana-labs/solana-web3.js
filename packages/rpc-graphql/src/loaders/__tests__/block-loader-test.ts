import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';
import type { Slot } from '@solana/rpc-types';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const slot = 511226n as Slot;
    beforeEach(() => {
        jest.useFakeTimers();
        rpc = {
            getAccountInfo: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getBlock: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getMultipleAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getProgramAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getTransaction: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
        };
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    describe('cached responses', () => {
        it('coalesces multiple requests for the same block into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block1: block(slot: $slot) {
                        blockhash
                    }
                    block2: block(slot: $slot) {
                        blockhash
                    }
                    block3: block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            rpcGraphQL.query(source, { slot });
            await jest.runAllTimersAsync();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            await jest.runAllTimersAsync();
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { slot });
            rpcGraphQL.query(source, { slot });
            await jest.runAllTimersAsync();
            expect(rpc.getBlock).toHaveBeenCalledTimes(2);
        });
    });
    describe('batch loading', () => {
        describe('request partitioning', () => {
            it('coalesces multiple requests for the same block but different fields into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block1: block(slot: $slot) {
                            blockhash
                        }
                        block2: block(slot: $slot) {
                            blockTime
                        }
                        block3: block(slot: $slot) {
                            previousBlockhash
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'none',
                });
            });
            it('coalesces multiple requests for the same block but one with specified `confirmed` commitment into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block1: block(slot: $slot) {
                            blockhash
                        }
                        block2: block(slot: $slot, commitment: CONFIRMED) {
                            blockhash
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'none',
                });
            });
            it('will not coalesce multiple requests for the same block but with different commitments into one request', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block1: block(slot: $slot) {
                            blockhash
                        }
                        block2: block(slot: $slot, commitment: CONFIRMED) {
                            blockhash
                        }
                        block3: block(slot: $slot, commitment: FINALIZED) {
                            blockhash
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(2);
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'none',
                });
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'finalized',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'none',
                });
            });
        });
        describe('encoding requests', () => {
            it('does not use `jsonParsed` if no parsed type is queried', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            blockhash
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'none',
                });
            });
            it('uses only `base58` if one data field is requested with `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                data(encoding: BASE_58)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('uses only `base64` if one data field is requested with `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                data(encoding: BASE_64)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('only uses `jsonParsed` if a parsed type is queried, but data is not', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    recentBlockhash
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('does not call the loader twice for other base fields and `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            blockhash
                            transactions {
                                data(encoding: BASE_58)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('does not call the loader twice for other base fields and `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            blockhash
                            transactions {
                                data(encoding: BASE_64)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('does not call the loader twice for other base fields and inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    recentBlockhash
                                    instructions {
                                        ... on GenericInstruction {
                                            programId
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('will not make multiple calls for more than one inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                message {
                                    recentBlockhash
                                    instructions {
                                        ... on GenericInstruction {
                                            programId
                                        }
                                        ... on CreateLookupTableInstruction {
                                            programId
                                        }
                                        ... on CloseLookupTableInstruction {
                                            programId
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('uses `jsonParsed` and the requested data encoding if a parsed type is queried alongside encoded data', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                data(encoding: BASE_64)
                                message {
                                    recentBlockhash
                                    instructions {
                                        ... on GenericInstruction {
                                            programId
                                        }
                                        ... on CreateLookupTableInstruction {
                                            programId
                                        }
                                        ... on CloseLookupTableInstruction {
                                            programId
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(2);
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
            it('uses only the number of requests for the number of different encodings requested', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            transactions {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(2);
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
            });
        });
        describe('signatures-only requests', () => {
            it('uses only `signatures` if the `signatures` field is requested', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            signatures
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'signatures',
                });
            });
            it('uses only `signatures` if the `signatures` field is requested with other fields', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            blockhash
                            blockTime
                            signatures
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(1);
                expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'signatures',
                });
            });
            it('will call once for `signatures` as well as once per encoding', async () => {
                expect.assertions(4);
                const source = /* GraphQL */ `
                    query testQuery($slot: Slot!) {
                        block(slot: $slot) {
                            blockhash
                            blockTime
                            signatures
                            transactions {
                                dataBase58: data(encoding: BASE_58)
                                dataBase64: data(encoding: BASE_64)
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { slot });
                await jest.runAllTimersAsync();
                expect(rpc.getBlock).toHaveBeenCalledTimes(3);
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
                expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'signatures',
                });
            });
        });
    });
});
