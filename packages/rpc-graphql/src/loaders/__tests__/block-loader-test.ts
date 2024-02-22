import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';
import type { Slot } from '@solana/rpc-types';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random slot for testing.
    // Not actually used. Just needed for proper query parsing.
    const slot = 511226n as Slot;
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
    describe('cache tests', () => {
        it('coalesces multiple requests for the same block into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
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
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            await jest.runAllTimersAsync();
            const source = /* GraphQL */ `
                query testQuery($slot: Slot!) {
                    block(slot: $slot) {
                        blockhash
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { slot });
            rpcGraphQL.query(source, { slot });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getBlock).toHaveBeenCalledTimes(2);
        });
    });
});
