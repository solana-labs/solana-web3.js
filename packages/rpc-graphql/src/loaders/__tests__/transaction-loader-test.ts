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

import { mockRpcResponse, mockTransactionVote } from '../../__tests__/__setup__';
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
    describe('cache tests', () => {
        it('coalesces multiple requests for the same transaction into one', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockTransactionVote)));
            const source = /* GraphQL */ `
                query testQuery {
                    transaction1: transaction(
                        signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                    ) {
                        slot
                    }
                    transaction2: transaction(
                        signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                    ) {
                        slot
                    }
                    transaction3: transaction(
                        signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                    ) {
                        slot
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
            await jest.runAllTimersAsync();
            const source = /* GraphQL */ `
                query testQuery {
                    transaction(
                        signature: "67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk"
                    ) {
                        slot
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
