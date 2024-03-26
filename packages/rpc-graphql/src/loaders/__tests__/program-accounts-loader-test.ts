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

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random address for testing.
    // Not actually used. Just needed for proper query parsing.
    const programAddress = 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj';
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
        it('coalesces multiple requests for the same program into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts1: programAccounts(programAddress: $programAddress) {
                        lamports
                    }
                    programAccounts2: programAccounts(programAddress: $programAddress) {
                        lamports
                    }
                    programAccounts3: programAccounts(programAddress: $programAddress) {
                        lamports
                    }
                }
            `;
            rpcGraphQL.query(source, { programAddress });
            await jest.runAllTimersAsync();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            await jest.runAllTimersAsync();
            const source = /* GraphQL */ `
                query testQuery($programAddress: Address!) {
                    programAccounts(programAddress: $programAddress) {
                        lamports
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { programAddress });
            rpcGraphQL.query(source, { programAddress });
            await jest.runAllTimersAsync();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
        });
    });
    describe('batch loading', () => {
        describe('request partitioning', () => {
            it('coalesces multiple requests for the same program but different fields into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        programAccounts1: programAccounts(programAddress: $address) {
                            lamports
                        }
                        programAccounts2: programAccounts(programAddress: $address) {
                            space
                        }
                        programAccounts3: programAccounts(programAddress: $address) {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' });
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('coalesces multiple requests for the same program but one with specified `confirmed` commitment into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        programAccounts1: programAccounts(programAddress: $address) {
                            lamports
                        }
                        programAccounts2: programAccounts(programAddress: $address, commitment: CONFIRMED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' });
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
            it('will not coalesce multiple requests for the same program but with different commitments into one request', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($address: Address!) {
                        programAccounts1: programAccounts(programAddress: $address) {
                            lamports
                        }
                        programAccounts2: programAccounts(programAddress: $address, commitment: CONFIRMED) {
                            lamports
                        }
                        programAccounts3: programAccounts(programAddress: $address, commitment: FINALIZED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { address: 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj' });
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'finalized',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
        });
        describe('encoding requests', () => {
            it('does not use `jsonParsed` if no parsed type is queried', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
            });
            it('uses only `base58` if one data field is requested with `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_58)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base58',
                    },
                );
            });
            it('uses only `base64` if one data field is requested with `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
            });
            it('uses only `base64+zstd` if one data field is requested with `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64_ZSTD)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64+zstd',
                    },
                );
            });
            it('only uses `jsonParsed` if a parsed type is queried, but data is not', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('does not call the loader twice for other base fields and `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_58)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base58',
                    },
                );
            });
            it('does not call the loader twice for other base fields and `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
            });
            it('does not call the loader twice for other base fields and `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64_ZSTD)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64+zstd',
                    },
                );
            });
            it('does not call the loader twice for other base fields and inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            lamports
                            space
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('will not make multiple calls for more than one inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            ... on MintAccount {
                                supply
                            }
                            ... on TokenAccount {
                                lamports
                            }
                            ... on NonceAccount {
                                blockhash
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('uses `jsonParsed` and the requested data encoding if a parsed type is queried alongside encoded data', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('uses only the number of requests for the number of different encodings requested', async () => {
                expect.assertions(5);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataBase58_1: data(encoding: BASE_58)
                            dataBase58_2: data(encoding: BASE_58)
                            dataBase58_3: data(encoding: BASE_58)
                            dataBase64_1: data(encoding: BASE_64)
                            dataBase64_2: data(encoding: BASE_64)
                            dataBase64_3: data(encoding: BASE_64)
                            dataBase64Zstd_1: data(encoding: BASE_64_ZSTD)
                            dataBase64Zstd_2: data(encoding: BASE_64_ZSTD)
                            dataBase64Zstd_3: data(encoding: BASE_64_ZSTD)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(4);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
        });
        describe('data slice requests', () => {
            it('does not call the loader twice for data slice and other fields', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    },
                );
            });
            it('coalesces a data with no data slice and data with data slice within byte limit to the same request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataWithNoSlice: data(encoding: BASE_64)
                            dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenLastCalledWith(
                    'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    },
                );
            });
            it('coalesces non-sliced and sliced data requests across encodings', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataBase58WithNoSlice: data(encoding: BASE_58)
                            dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 0 })
                            dataBase64WithNoSlice: data(encoding: BASE_64)
                            dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 20, offset: 4 })
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base58', // No `dataSlice` arg since one field asked for the whole data
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                });
            });
            it('always uses separate requests for `base64+zstd` no matter the data slice', async () => {
                expect.assertions(4);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataBase64ZstdWithNoSlice: data(encoding: BASE_64_ZSTD)
                            dataBase64ZstdWithSlice1: data(encoding: BASE_64_ZSTD, dataSlice: { length: 16, offset: 4 })
                            dataBase64ZstdWithSlice2: data(
                                encoding: BASE_64_ZSTD
                                dataSlice: { length: 40, offset: 12 }
                            )
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(3);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 16, offset: 4 },
                    encoding: 'base64+zstd',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 40, offset: 12 },
                    encoding: 'base64+zstd',
                });
            });
            it('coalesces multiple data slice requests within byte limit to the same request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataSlice1: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            dataSlice2: data(encoding: BASE_64, dataSlice: { length: 16, offset: 2 })
                            dataSlice3: data(encoding: BASE_64, dataSlice: { length: 20, offset: 6 })
                            dataSlice4: data(encoding: BASE_64, dataSlice: { length: 10, offset: 10 })
                            dataSlice5: data(encoding: BASE_64, dataSlice: { length: 10, offset: 30 })
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 40, offset: 0 }, // Coalesced into one slice
                    encoding: 'base64',
                });
            });
            it('splits multiple data slice requests beyond byte limit into two requests', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataSlice1: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                            dataSlice2: data(encoding: BASE_64, dataSlice: { length: 4, offset: 2000 })
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 0 },
                    encoding: 'base64',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 2000 },
                    encoding: 'base64',
                });
            });
            it('honors the byte limit across encodings', async () => {
                expect.assertions(5);
                const source = /* GraphQL */ `
                    query testQuery {
                        programAccounts(programAddress: "DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj") {
                            dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { length: 4, offset: 0 })
                            dataBase58BeyondByteLimit: data(encoding: BASE_58, dataSlice: { length: 4, offset: 2000 })
                            dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                            dataBase64BeyondByteLimit: data(encoding: BASE_64, dataSlice: { length: 4, offset: 2000 })
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(4);
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 0 },
                    encoding: 'base58',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 2000 },
                    encoding: 'base58',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 0 },
                    encoding: 'base64',
                });
                expect(rpc.getProgramAccounts).toHaveBeenCalledWith('DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj', {
                    commitment: 'confirmed',
                    dataSlice: { length: 4, offset: 2000 },
                    encoding: 'base64',
                });
            });
        });
    });
});
