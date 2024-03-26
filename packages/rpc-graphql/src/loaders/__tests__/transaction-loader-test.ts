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
    // Random signature for testing.
    // Not actually used. Just needed for proper query parsing.
    const signature = '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk';
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
        it('coalesces multiple requests for the same transaction into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction1: transaction(signature: $signature) {
                        slot
                    }
                    transaction2: transaction(signature: $signature) {
                        slot
                    }
                    transaction3: transaction(signature: $signature) {
                        slot
                    }
                }
            `;
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        slot
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { signature });
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(2);
        });
    });
    describe('batch loading', () => {
        describe('request partitioning', () => {
            it('coalesces multiple requests for the same transaction but different fields into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction1: transaction(signature: $signature) {
                            blockTime
                        }
                        transaction2: transaction(signature: $signature) {
                            slot
                        }
                        transaction3: transaction(signature: $signature) {
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source, {
                    signature:
                        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                });
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('coalesces multiple requests for the same transaction but one with specified `confirmed` commitment into one request', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction1: transaction(signature: $signature) {
                            blockTime
                        }
                        transaction2: transaction(signature: $signature, commitment: CONFIRMED) {
                            blockTime
                        }
                    }
                `;
                rpcGraphQL.query(source, {
                    signature:
                        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                });
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
            it('will not coalesce multiple requests for the same transaction but with different commitments into one request', async () => {
                expect.assertions(3);
                const source = /* GraphQL */ `
                    query testQuery($signature: Signature!) {
                        transaction1: transaction(signature: $signature) {
                            blockTime
                        }
                        transaction2: transaction(signature: $signature, commitment: CONFIRMED) {
                            blockTime
                        }
                        transaction3: transaction(signature: $signature, commitment: FINALIZED) {
                            blockTime
                        }
                    }
                `;
                rpcGraphQL.query(source, {
                    signature:
                        '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                });
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(2);
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'finalized',
                        encoding: 'base64', // GraphQL client prefers `base64`
                    },
                );
            });
        });
        describe('encoding requests', () => {
            it('does not use `jsonParsed` if no parsed type is queried', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            blockTime
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            data(encoding: BASE_58)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            data(encoding: BASE_64)
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
            });
            it('only uses `jsonParsed` if a parsed type is queried, but data is not', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            blockTime
                            data(encoding: BASE_58)
                            slot
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            blockTime
                            data(encoding: BASE_64)
                            slot
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
            });
            it('does not call the loader twice for other base fields and inline fragment', async () => {
                expect.assertions(2);
                const source = /* GraphQL */ `
                    query testQuery {
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                    ... on SplTokenInitializeAccountInstruction {
                                        mint {
                                            address
                                        }
                                    }
                                    ... on SplTokenInitializeMultisigInstruction {
                                        multisig {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
                expect(rpc.getTransaction).toHaveBeenLastCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
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
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            data(encoding: BASE_64)
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(2);
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
            it('uses only the number of requests for the number of different encodings requested', async () => {
                expect.assertions(4);
                const source = /* GraphQL */ `
                    query testQuery {
                        transaction(
                            signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                        ) {
                            dataBase58_1: data(encoding: BASE_58)
                            dataBase58_2: data(encoding: BASE_58)
                            dataBase58_3: data(encoding: BASE_58)
                            dataBase64_1: data(encoding: BASE_64)
                            dataBase64_2: data(encoding: BASE_64)
                            dataBase64_3: data(encoding: BASE_64)
                            message {
                                instructions {
                                    ... on SplTokenInitializeMintInstruction {
                                        decimals
                                        mint {
                                            address
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;
                rpcGraphQL.query(source);
                await jest.runAllTimersAsync();
                expect(rpc.getTransaction).toHaveBeenCalledTimes(3);
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base58',
                    },
                );
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'base64',
                    },
                );
                expect(rpc.getTransaction).toHaveBeenCalledWith(
                    '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk',
                    {
                        commitment: 'confirmed',
                        encoding: 'jsonParsed',
                    },
                );
            });
        });
    });
});
