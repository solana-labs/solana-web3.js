import {
    createSolanaRpcApi,
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
} from '@solana/rpc-core';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc, Slot } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { mockBlockNone, mockRpcResponse } from '../../__tests__/__setup__';
import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const defaultSlot = 511226n as Slot;
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
        it('coalesces multiple requests for the same block into one', async () => {
            expect.assertions(1);
            fetchMock.mockOnce(JSON.stringify(mockRpcResponse(mockBlockNone)));
            const source = /* GraphQL */ `
                query testQuery($slot: BigInt!) {
                    block1: block(slot: $slot) {
                        blockhash
                    }
                    block2: block(slot: $slot) {
                        blockhash
                    }
                    block3: block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            rpcGraphQL.query(source, { slot: defaultSlot });
            await jest.runAllTimersAsync();
            jest.runAllTicks();
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            await jest.runAllTimersAsync();
            const source = /* GraphQL */ `
                query testQuery($slot: BigInt!) {
                    block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { slot: defaultSlot });
            rpcGraphQL.query(source, { slot: defaultSlot });
            await jest.runAllTimersAsync();
            jest.runAllTicks();
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });
    });
});
