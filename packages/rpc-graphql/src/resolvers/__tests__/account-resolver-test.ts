import { Address } from '@solana/addresses';
import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account resolver', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        jest.useFakeTimers();
        rpc = {
            getAccountInfo: jest.fn().mockImplementation((address: Address) => {
                const owner =
                    address === 'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'
                        ? 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                        : 'BPFLoader2111111111111111111111111111111111';
                return {
                    send: async () => ({
                        context: {
                            slot: 0,
                        },
                        value: {
                            data: ['AA', 'base64'],
                            owner,
                        },
                    }),
                };
            }),
            getBlock: jest.fn(),
            getMultipleAccounts: jest.fn(),
            getProgramAccounts: jest.fn(),
            getTransaction: jest.fn(),
        };
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    describe('address-only requests', () => {
        describe('in the first level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                        }
                    }
                `;
                rpcGraphQL.query(source);
                // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
                await Promise.resolve();
                jest.runAllTimers();
                expect(rpc.getAccountInfo).not.toHaveBeenCalled();
            });
        });
        describe('in the second level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
                await Promise.resolve();
                jest.runAllTimers();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            });
        });
        describe('in the third level', () => {
            it('will not call the RPC for only an address', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    address
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.advanceTimersToNextTimerAsync(); // Advance past layer 1
                await jest.advanceTimersToNextTimerAsync(); // Advance past layer 2
                // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
                await Promise.resolve();
                jest.runAllTimers();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
            });
        });
    });
});
