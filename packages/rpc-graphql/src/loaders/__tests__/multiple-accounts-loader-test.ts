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

describe('multiple accounts loader', () => {
    let rpc: {
        getAccountInfo: jest.MockedFunction<Rpc<GetAccountInfoApi>['getAccountInfo']>;
        getBlock: jest.MockedFunction<Rpc<GetBlockApi>['getBlock']>;
        getMultipleAccounts: jest.MockedFunction<Rpc<GetMultipleAccountsApi>['getMultipleAccounts']>;
        getProgramAccounts: jest.MockedFunction<Rpc<GetProgramAccountsApi>['getProgramAccounts']>;
        getTransaction: jest.MockedFunction<Rpc<GetTransactionApi>['getTransaction']>;
    };
    let rpcGraphQL: RpcGraphQL;
    // Random addresses for testing.
    // Not actually used. Just needed for proper query parsing.
    const addresses = [
        '54BtAvQ9agJjeb5q8vLMEbf72KwcyfMu87JhhcXCnAoq',
        '6mTPNpsyXsv8Anx3E9rzV6uwwebFruftAHoZRdp4iCeo',
        'C8ShshN7Xgt91sNn2aHZvDPLFikJWJTD52xstCAudfvH',
        'c63MKv6fzJMaiKSyA3xnWFXn7YGi9aBXGFzFB86ZhKB',
        '3yKcat17YswFjy8LF2UTjbEGi7RxmHczZiCEH5zrpoCe',
        'DxFfzP8BV9bfeRYyt5DqEc51MYx73Uvzji67CNbt1VhN',
    ];
    beforeEach(() => {
        jest.useFakeTimers();
        rpc = {
            getAccountInfo: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getBlock: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getMultipleAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getProgramAccounts: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
            getTransaction: jest.fn().mockReturnValue({ send: jest.fn().mockReturnValue(FOREVER_PROMISE) }),
        };
        rpcGraphQL = createRpcGraphQL(
            rpc as unknown as Rpc<
                GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
            >,
        );
    });
    describe('cached responses', () => {
        it('coalesces multiple requests for the same accounts into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($addresses: [Address!]!) {
                    multipleAccounts1: multipleAccounts(addresses: $addresses) {
                        lamports
                    }
                    multipleAccounts2: multipleAccounts(addresses: $addresses) {
                        lamports
                    }
                    multipleAccounts3: multipleAccounts(addresses: $addresses) {
                        lamports
                    }
                }
            `;
            rpcGraphQL.query(source, { addresses });
            await jest.runAllTimersAsync();
            expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($addresses: [Address!]!) {
                    multipleAccounts(addresses: $addresses) {
                        lamports
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { addresses });
            rpcGraphQL.query(source, { addresses });
            await jest.runAllTimersAsync();
            expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
        });
    });
    describe('batch loading', () => {
        describe('request partitioning', () => {
            it('coalesces multiple requests for the same accounts but different fields into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts1: multipleAccounts(addresses: $addresses) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addresses) {
                            space
                        }
                        multipleAccounts3: multipleAccounts(addresses: $addresses) {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('coalesces multiple requests for the same accounts but one with specified `confirmed` commitment into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts1: multipleAccounts(addresses: $addresses) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addresses, commitment: CONFIRMED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('will not coalesce multiple requests for the same account but with different commitments into one request', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts1: multipleAccounts(addresses: $addresses) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addresses, commitment: CONFIRMED) {
                            lamports
                        }
                        multipleAccounts3: multipleAccounts(addresses: $addresses, commitment: FINALIZED) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'finalized',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('coalesces multiple requests for multiple accounts into one `getMultipleAccounts` request', async () => {
                expect.assertions(2);
                const address1 = addresses[0];
                const address2 = addresses[1];
                const address3 = addresses[2];
                const address4 = addresses[3];
                const address5 = addresses[4];
                const address6 = addresses[5];
                const source = /* GraphQL */ `
                    query testQuery(
                        $addresses1: [Address!]!
                        $addresses2: [Address!]!
                        $addresses3: [Address!]!
                        $addresses4: [Address!]!
                        $addresses5: [Address!]!
                        $addresses6: [Address!]!
                    ) {
                        multipleAccounts1: multipleAccounts(addresses: $addresses1) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addresses2) {
                            lamports
                        }
                        multipleAccounts3: multipleAccounts(addresses: $addresses3) {
                            lamports
                        }
                        multipleAccounts4: multipleAccounts(addresses: $addresses4) {
                            lamports
                        }
                        multipleAccounts5: multipleAccounts(addresses: $addresses5) {
                            lamports
                        }
                        multipleAccounts6: multipleAccounts(addresses: $addresses6) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, {
                    addresses1: [address1],
                    addresses2: [address2],
                    addresses3: [address3],
                    addresses4: [address4],
                    addresses5: [address5],
                    addresses6: [address6],
                });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('coalesces multiple requests for multiple accounts into one `getMultipleAccounts` request, coalescing `confirmed` commitments', async () => {
                expect.assertions(2);
                const addressesChunk1 = addresses.slice(0, 2);
                const addressesChunk2 = addresses.slice(2, 4);
                const addressesChunk3 = addresses.slice(4);
                const source = /* GraphQL */ `
                    query testQuery(
                        $addressesChunk1: [Address!]!
                        $addressesChunk2: [Address!]!
                        $addressesChunk3: [Address!]!
                    ) {
                        multipleAccounts1: multipleAccounts(addresses: $addressesChunk1) {
                            lamports
                        }
                        multipleAccounts1Confirmed: multipleAccounts(
                            addresses: $addressesChunk1
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addressesChunk2) {
                            lamports
                        }
                        multipleAccounts2Confirmed: multipleAccounts(
                            addresses: $addressesChunk2
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        multipleAccounts3: multipleAccounts(addresses: $addressesChunk3) {
                            lamports
                        }
                        multipleAccounts3Confirmed: multipleAccounts(
                            addresses: $addressesChunk3
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addressesChunk1, addressesChunk2, addressesChunk3 });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('will not coalesce multiple requests for multiple accounts into one `getMultipleAccounts` request when different commitments are requested', async () => {
                expect.assertions(3);
                const addressesChunk1 = addresses.slice(0, 2);
                const addressesChunk2 = addresses.slice(2, 4);
                const addressesChunk3 = addresses.slice(4);
                const source = /* GraphQL */ `
                    query testQuery(
                        $addressesChunk1: [Address!]!
                        $addressesChunk2: [Address!]!
                        $addressesChunk3: [Address!]!
                    ) {
                        multipleAccounts1: multipleAccounts(addresses: $addressesChunk1) {
                            lamports
                        }
                        multipleAccounts1Confirmed: multipleAccounts(
                            addresses: $addressesChunk1
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        multipleAccounts1Finalized: multipleAccounts(
                            addresses: $addressesChunk1
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        multipleAccounts2: multipleAccounts(addresses: $addressesChunk2) {
                            lamports
                        }
                        multipleAccounts2Confirmed: multipleAccounts(
                            addresses: $addressesChunk2
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        multipleAccounts2Finalized: multipleAccounts(
                            addresses: $addressesChunk2
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                        multipleAccounts3: multipleAccounts(addresses: $addressesChunk3) {
                            lamports
                        }
                        multipleAccounts3Confirmed: multipleAccounts(
                            addresses: $addressesChunk3
                            commitment: CONFIRMED
                        ) {
                            lamports
                        }
                        multipleAccounts3Finalized: multipleAccounts(
                            addresses: $addressesChunk3
                            commitment: FINALIZED
                        ) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addressesChunk1, addressesChunk2, addressesChunk3 });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'finalized',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
            it('breaks multiple account requests into multiple `getMultipleAccounts` requests if the batch limit is exceeded', async () => {
                expect.assertions(3);

                rpcGraphQL = createRpcGraphQL(
                    rpc as unknown as Rpc<
                        GetAccountInfoApi &
                            GetBlockApi &
                            GetMultipleAccountsApi &
                            GetProgramAccountsApi &
                            GetTransactionApi
                    >,
                    { maxMultipleAccountsBatchSize: 3 }, // const `addresses` has 6 elements.
                );

                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });

                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses.slice(0, 3), {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses.slice(3), {
                    commitment: 'confirmed',
                    encoding: 'base64', // GraphQL client prefers `base64`
                });
            });
        });
        describe('encoding requests', () => {
            it('does not use `jsonParsed` if no parsed type is queried', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            lamports
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('uses only `base58` if one data field is requested with `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_58)
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
            });
            it('uses only `base64` if one data field is requested with `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_64)
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('uses only `base64+zstd` if one data field is requested with `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_64_ZSTD)
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
            });
            it('only uses `jsonParsed` if a parsed type is queried, but data is not', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('does not call the loader twice for other base fields and `base58` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_58)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
            });
            it('does not call the loader twice for other base fields and `base64` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_64)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
            });
            it('does not call the loader twice for other base fields and `base64+zstd` encoding', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_64_ZSTD)
                            lamports
                            space
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64+zstd',
                });
            });
            it('does not call the loader twice for other base fields and inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            lamports
                            space
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('will not make multiple calls for more than one inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
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
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('uses `jsonParsed` and the requested data encoding if a parsed type is queried alongside encoded data', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            data(encoding: BASE_64)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
            it('uses only the number of requests for the number of different encodings requested', async () => {
                expect.assertions(4);
                const source = /* GraphQL */ `
                    query testQuery($addresses: [Address!]!) {
                        multipleAccounts(addresses: $addresses) {
                            dataBase58_1: data(encoding: BASE_58)
                            dataBase58_2: data(encoding: BASE_58)
                            dataBase58_3: data(encoding: BASE_58)
                            dataBase64_1: data(encoding: BASE_64)
                            dataBase64_2: data(encoding: BASE_64)
                            dataBase64_3: data(encoding: BASE_64)
                            ... on MintAccount {
                                supply
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, { addresses });
                await jest.runAllTimersAsync();
                expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(3);
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base58',
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'base64',
                });
                expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                    commitment: 'confirmed',
                    encoding: 'jsonParsed',
                });
            });
        });
        describe('data slice requests', () => {
            describe('single multipleAccounts queries', () => {
                it('does not call the loader twice for data slice and other fields', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    });
                });
                it('coalesces a data with no data slice and data with data slice within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    });
                });
                it('coalesces non-sliced and sliced data requests across encodings', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 0 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 20, offset: 4 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base58', // No `dataSlice` arg since one field asked for the whole data
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    });
                });
                it('always uses separate requests for `base64+zstd` no matter the data slice', async () => {
                    expect.assertions(4);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataBase64ZstdWithNoSlice: data(encoding: BASE_64_ZSTD)
                                dataBase64ZstdWithSlice1: data(
                                    encoding: BASE_64_ZSTD
                                    dataSlice: { length: 16, offset: 4 }
                                )
                                dataBase64ZstdWithSlice2: data(
                                    encoding: BASE_64_ZSTD
                                    dataSlice: { length: 40, offset: 12 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(3);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base64+zstd',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 16, offset: 4 },
                        encoding: 'base64+zstd',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 40, offset: 12 },
                        encoding: 'base64+zstd',
                    });
                });
                it('coalesces multiple data slice requests within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { length: 16, offset: 2 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { length: 20, offset: 6 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { length: 10, offset: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { length: 10, offset: 30 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 40, offset: 0 }, // Coalesced into one slice
                        encoding: 'base64',
                    });
                });
                it('splits multiple data slice requests beyond byte limit into two requests', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { length: 4, offset: 2000 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
                it('honors the byte limit across encodings', async () => {
                    expect.assertions(5);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccounts(addresses: $addresses) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { length: 4, offset: 0 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { length: 4, offset: 2000 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { length: 4, offset: 0 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { length: 4, offset: 2000 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(4);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
            });
            describe('multiple multipleAccounts queries', () => {
                it('does not call the loader twice for data slice and other fields', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccountsA: multipleAccounts(addresses: $addresses) {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addresses) {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addresses) {
                                data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                                lamports
                                space
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 10, offset: 0 },
                        encoding: 'base64',
                    });
                });
                it('coalesces a data with no data slice and data with data slice within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccountsA: multipleAccounts(addresses: $addresses) {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addresses) {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addresses) {
                                dataWithNoSlice: data(encoding: BASE_64)
                                dataWithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenLastCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    });
                });
                it('coalesces non-sliced and sliced data requests across encodings', async () => {
                    expect.assertions(3);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccountsA: multipleAccounts(addresses: $addresses) {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 0 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 12, offset: 4 })
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addresses) {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 14, offset: 4 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 10, offset: 0 })
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addresses) {
                                dataBase58WithNoSlice: data(encoding: BASE_58)
                                dataBase58WithSlice: data(encoding: BASE_58, dataSlice: { length: 10, offset: 50 })
                                dataBase64WithNoSlice: data(encoding: BASE_64)
                                dataBase64WithSlice: data(encoding: BASE_64, dataSlice: { length: 100, offset: 0 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base58', // No `dataSlice` arg since one field asked for the whole data
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        encoding: 'base64', // No `dataSlice` arg since one field asked for the whole data
                    });
                });
                it('coalesces multiple data slice requests within byte limit to the same request', async () => {
                    expect.assertions(2);
                    const source = /* GraphQL */ `
                        query testQuery($addresses: [Address!]!) {
                            multipleAccountsA: multipleAccounts(addresses: $addresses) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addresses) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addresses) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 10 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2, length: 16 })
                                dataSlice3: data(encoding: BASE_64, dataSlice: { offset: 6, length: 20 })
                                dataSlice4: data(encoding: BASE_64, dataSlice: { offset: 10, length: 10 })
                                dataSlice5: data(encoding: BASE_64, dataSlice: { offset: 30, length: 10 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addresses });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 40, offset: 0 }, // Coalesced into one slice
                        encoding: 'base64',
                    });
                });
                it('splits multiple data slice requests beyond the default byte limit into two requests', async () => {
                    expect.assertions(3);
                    const addressesChunk1 = addresses.slice(0, 2);
                    const addressesChunk2 = addresses.slice(2, 4);
                    const addressesChunk3 = addresses.slice(4);
                    const source = /* GraphQL */ `
                        query testQuery(
                            $addressesChunk1: [Address!]!
                            $addressesChunk2: [Address!]!
                            $addressesChunk3: [Address!]!
                        ) {
                            multipleAccountsA: multipleAccounts(addresses: $addressesChunk1) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addressesChunk2) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addressesChunk3) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(encoding: BASE_64, dataSlice: { offset: 2000, length: 4 })
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addressesChunk1, addressesChunk2, addressesChunk3 });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
                it('splits multiple data slice requests beyond a provided byte limit into two requests', async () => {
                    expect.assertions(3);
                    const addressesChunk1 = addresses.slice(0, 2);
                    const addressesChunk2 = addresses.slice(2, 4);
                    const addressesChunk3 = addresses.slice(4);
                    const maxDataSliceByteRange = 100;
                    rpcGraphQL = createRpcGraphQL(
                        rpc as unknown as Rpc<
                            GetAccountInfoApi &
                                GetBlockApi &
                                GetMultipleAccountsApi &
                                GetProgramAccountsApi &
                                GetTransactionApi
                        >,
                        {
                            maxDataSliceByteRange,
                        },
                    );
                    const source = /* GraphQL */ `
                        query testQuery(
                            $addressesChunk1: [Address!]!
                            $addressesChunk2: [Address!]!
                            $addressesChunk3: [Address!]!
                            $maxDataSliceByteRange: Int!
                        ) {
                            multipleAccountsA: multipleAccounts(addresses: $addressesChunk1) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addressesChunk2) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addressesChunk3) {
                                dataSlice1: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataSlice2: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, {
                        addressesChunk1,
                        addressesChunk2,
                        addressesChunk3,
                        maxDataSliceByteRange,
                    });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(2);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: maxDataSliceByteRange },
                        encoding: 'base64',
                    });
                });
                it('honors the default byte limit across encodings', async () => {
                    expect.assertions(5);
                    const addressesChunk1 = addresses.slice(0, 2);
                    const addressesChunk2 = addresses.slice(2, 4);
                    const addressesChunk3 = addresses.slice(4);
                    const source = /* GraphQL */ `
                        query testQuery(
                            $addressesChunk1: [Address!]!
                            $addressesChunk2: [Address!]!
                            $addressesChunk3: [Address!]!
                        ) {
                            multipleAccountsA: multipleAccounts(addresses: $addressesChunk1) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addressesChunk2) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addressesChunk3) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: 2000, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, { addressesChunk1, addressesChunk2, addressesChunk3 });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(4);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 2000 },
                        encoding: 'base64',
                    });
                });
                it('honors a provided byte limit across encodings', async () => {
                    expect.assertions(5);
                    const addressesChunk1 = addresses.slice(0, 2);
                    const addressesChunk2 = addresses.slice(2, 4);
                    const addressesChunk3 = addresses.slice(4);
                    const maxDataSliceByteRange = 100;
                    rpcGraphQL = createRpcGraphQL(
                        rpc as unknown as Rpc<
                            GetAccountInfoApi &
                                GetBlockApi &
                                GetMultipleAccountsApi &
                                GetProgramAccountsApi &
                                GetTransactionApi
                        >,
                        {
                            maxDataSliceByteRange,
                        },
                    );
                    const source = /* GraphQL */ `
                        query testQuery(
                            $addressesChunk1: [Address!]!
                            $addressesChunk2: [Address!]!
                            $addressesChunk3: [Address!]!
                            $maxDataSliceByteRange: Int!
                        ) {
                            multipleAccountsA: multipleAccounts(addresses: $addressesChunk1) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            multipleAccountsB: multipleAccounts(addresses: $addressesChunk2) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                            multipleAccountsC: multipleAccounts(addresses: $addressesChunk3) {
                                dataBase58WithinByteLimit: data(encoding: BASE_58, dataSlice: { offset: 0, length: 4 })
                                dataBase58BeyondByteLimit: data(
                                    encoding: BASE_58
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                                dataBase64WithinByteLimit: data(encoding: BASE_64, dataSlice: { offset: 0, length: 4 })
                                dataBase64BeyondByteLimit: data(
                                    encoding: BASE_64
                                    dataSlice: { offset: $maxDataSliceByteRange, length: 4 }
                                )
                            }
                        }
                    `;
                    rpcGraphQL.query(source, {
                        addressesChunk1,
                        addressesChunk2,
                        addressesChunk3,
                        maxDataSliceByteRange,
                    });
                    await jest.runAllTimersAsync();
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledTimes(4);
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: maxDataSliceByteRange },
                        encoding: 'base58',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: 0 },
                        encoding: 'base64',
                    });
                    expect(rpc.getMultipleAccounts).toHaveBeenCalledWith(addresses, {
                        commitment: 'confirmed',
                        dataSlice: { length: 4, offset: maxDataSliceByteRange },
                        encoding: 'base64',
                    });
                });
            });
        });
    });
});
