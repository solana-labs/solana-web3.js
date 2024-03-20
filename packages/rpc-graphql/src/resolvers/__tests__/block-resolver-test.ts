import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';
import type { Slot } from '@solana/rpc-types';

import { createRpcGraphQL, RpcGraphQL } from '../../index.js';

describe('block resolver', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const slot = 511226n as Slot;
    beforeEach(() => {
        jest.useFakeTimers();
        rpc = {
            getAccountInfo: jest.fn(),
            getBlock: jest.fn(),
            getMultipleAccounts: jest.fn(),
            getProgramAccounts: jest.fn(),
            getTransaction: jest.fn(),
        };
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    describe('fragment spreads', () => {
        it('will resolve fields from fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        ...GetBlockhash
                    }
                }
                fragment GetBlockhash on Block {
                    blockhash
                }
            `;
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
            expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'none',
            });
        });
        it('will resolve fields from multiple fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        ...GetBlockhash
                        ...GetParentSlot
                    }
                }
                fragment GetBlockhash on Block {
                    blockhash
                }
                fragment GetParentSlot on Block {
                    parentSlot
                }
            `;
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
            expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'none',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            message {
                                instructions {
                                    ...GetGenericInstructionData
                                }
                            }
                        }
                    }
                }
                fragment GetGenericInstructionData on TransactionInstruction {
                    ... on GenericInstruction {
                        data
                    }
                }
            `;
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
            expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'full',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            ...GetDataAndGenericInstructionData
                        }
                    }
                }
                fragment GetDataAndGenericInstructionData on Transaction {
                    transactionData: data(encoding: BASE_58)
                    message {
                        instructions {
                            ... on GenericInstruction {
                                data
                            }
                        }
                    }
                }
            `;
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(2);
            expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'full',
            });
            expect(rpc.getBlock).toHaveBeenCalledWith(slot, {
                commitment: 'confirmed',
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'full',
            });
        });
        it('will resolve fragment spreads with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        transactions {
                            ...GetTransactionData
                        }
                    }
                }
                fragment GetTransactionData on Transaction {
                    transactionData: data(encoding: BASE_58)
                }
            `;
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
            expect(rpc.getBlock).toHaveBeenLastCalledWith(slot, {
                commitment: 'confirmed',
                encoding: 'base58',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'full',
            });
            expect(rpc.getBlock).not.toHaveBeenCalledWith(slot, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
                transactionDetails: 'full',
            });
        });
    });
});
