import {
    createSolanaRpcApi,
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
} from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    beforeEach(() => {
        jest.useFakeTimers();
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<
            GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi
        >({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
        rpcGraphQL = createRpcGraphQL(rpc);
    });
    describe('cached responses', () => {
        it('coalesces multiple requests for the same account into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery {
                    account1: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                        lamports
                    }
                    account2: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                        lamports
                    }
                    account3: account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                        lamports
                    }
                }
            `;
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            jest.runAllTicks();
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery {
                    account(address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr") {
                        lamports
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source);
            rpcGraphQL.query(source);
            await jest.runAllTimersAsync();
            jest.runAllTicks();
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });
    });
});
