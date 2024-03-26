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

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

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
                    send: () =>
                        Promise.resolve({
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
            getBlock: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getMultipleAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getProgramAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getTransaction: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
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
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).not.toHaveBeenCalled();
            });
            it('will not call the RPC for only an address in an inline fragment', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            ... on MintAccount {
                                address
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).not.toHaveBeenCalled();
            });
            it('will not call the RPC for only an address in a fragment spread', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            ...GetAddress
                        }
                    }
                    fragment GetAddress {
                        address
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
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
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            });
            it('will not call the RPC for only an address in an inline fragment', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                ... on MintAccount {
                                    address
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            });
            it('will not call the RPC for only an address in a fragment spread', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                ...GetAddress
                            }
                        }
                    }
                    fragment GetAddress {
                        address
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).not.toHaveBeenCalled();
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
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
            });
            it('will not call the RPC for only an address in an inline fragment', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    ... on MintAccount {
                                        address
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            });
            it('will not call the RPC for only an address in a fragment spread', async () => {
                expect.assertions(1);
                const source = /* GraphQL */ `
                    query testQuery {
                        account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                            address
                            ownerProgram {
                                address
                                ownerProgram {
                                    ...GetAddress
                                }
                            }
                        }
                    }
                    fragment GetAddress {
                        address
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getAccountInfo).not.toHaveBeenCalled();
            });
        });
    });
    describe('inline fragments', () => {
        it('will resolve inline fragments with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            supply
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
        it('will resolve inline fragments with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            data(encoding: BASE_58)
                            supply
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
            expect(rpc.getAccountInfo).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
            expect(rpc.getAccountInfo).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
        });
        it('will resolve inline fragments with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            data(encoding: BASE_58)
                            lamports
                            space
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
            expect(rpc.getAccountInfo).not.toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
    });
    describe('fragment spreads', () => {
        it('will resolve fields from fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetLamports
                    }
                }
                fragment GetLamports on Account {
                    lamports
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64',
            });
        });
        it('will resolve fields from multiple fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetLamports
                        ...GetDataBase64
                    }
                }
                fragment GetLamports on Account {
                    lamports
                }
                fragment GetDataBase64 on Account {
                    data(encoding: BASE_64_ZSTD)
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64+zstd',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetLamportsAndSupplyFromMintAccount
                    }
                }
                fragment GetLamportsAndSupplyFromMintAccount on Account {
                    ... on MintAccount {
                        lamports
                        supply
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetDataAndSupplyFromMintAccount
                    }
                }
                fragment GetDataAndSupplyFromMintAccount on Account {
                    ... on MintAccount {
                        data(encoding: BASE_58)
                        supply
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
            expect(rpc.getAccountInfo).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
            expect(rpc.getAccountInfo).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
        });
        it('will resolve fragment spreads with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetLamportsAndDataFromMintAccount
                    }
                }
                fragment GetLamportsAndDataFromMintAccount on Account {
                    ... on MintAccount {
                        lamports
                        data(encoding: BASE_64_ZSTD)
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
            expect(rpc.getAccountInfo).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64+zstd',
            });
            expect(rpc.getAccountInfo).not.toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
    });
});
