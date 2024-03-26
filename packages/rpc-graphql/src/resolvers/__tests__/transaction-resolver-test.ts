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

describe('transaction resolver', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
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
    describe('fragment spreads', () => {
        it('will resolve fields from fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        ...GetBlockTime
                    }
                }
                fragment GetBlockTime on Transaction {
                    blockTime
                }
            `;
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
            expect(rpc.getTransaction).toHaveBeenLastCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'base64',
            });
        });
        it('will resolve fields from multiple fragment spreads', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        ...GetBlockTime
                        ...GetDataBase64
                    }
                }
                fragment GetBlockTime on Transaction {
                    blockTime
                }
                fragment GetDataBase64 on Transaction {
                    data(encoding: BASE_64)
                }
            `;
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
            expect(rpc.getTransaction).toHaveBeenLastCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'base64',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` when `jsonParsed` fields are requested', async () => {
            expect.assertions(2);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        message {
                            instructions {
                                ...GetGenericInstructionData
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
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
            expect(rpc.getTransaction).toHaveBeenLastCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
        it('will resolve fragment spreads with `jsonParsed` and the proper encoding when data and `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        ...GetDataAndGenericInstructionData
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
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(2);
            expect(rpc.getTransaction).toHaveBeenCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
            expect(rpc.getTransaction).toHaveBeenCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'base58',
            });
        });
        it('will resolve fragment spreads with only the proper encoding not `jsonParsed` when no `jsonParsed` fields are requested', async () => {
            expect.assertions(3);
            const source = /* GraphQL */ `
                query testQuery($signature: Signature!) {
                    transaction(signature: $signature) {
                        ...GetTransactionData
                    }
                }
                fragment GetTransactionData on Transaction {
                    transactionData: data(encoding: BASE_58)
                }
            `;
            rpcGraphQL.query(source, { signature });
            await jest.runAllTimersAsync();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(1);
            expect(rpc.getTransaction).toHaveBeenLastCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'base58',
            });
            expect(rpc.getTransaction).not.toHaveBeenCalledWith(signature, {
                commitment: 'confirmed',
                encoding: 'jsonParsed',
            });
        });
    });
});
