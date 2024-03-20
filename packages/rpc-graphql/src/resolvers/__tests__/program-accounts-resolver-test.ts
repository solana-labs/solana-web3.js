import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../../index.js';

describe('program accounts resolver', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
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
    describe('inline fragments', () => {
        it('will resolve inline fragments with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            supply
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
        it('will resolve inline fragments with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            data(encoding: BASE_58)
                            supply
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
            expect(rpc.getProgramAccounts).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
            expect(rpc.getProgramAccounts).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
        });
        it('will resolve inline fragments with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ... on MintAccount {
                            data(encoding: BASE_58)
                            lamports
                            space
                        }
                    }
                }
            `;
            rpcGraphQL.query(source);
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
            expect(rpc.getProgramAccounts).not.toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
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
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
                        ...GetLamports
                    }
                }
                fragment GetLamports on Account {
                    lamports
                }
            `;
            rpcGraphQL.query(source);
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64',
            });
        });
        it('will resolve fields from multiple fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64+zstd',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
            expect(rpc.getProgramAccounts).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
            expect(rpc.getProgramAccounts).toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base58',
            });
        });
        it('will resolve fragment spreads with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery {
                    programAccounts(programAddress: "AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca") {
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
            expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'base64+zstd',
            });
            expect(rpc.getProgramAccounts).not.toHaveBeenCalledWith('AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca', {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
    });
});
