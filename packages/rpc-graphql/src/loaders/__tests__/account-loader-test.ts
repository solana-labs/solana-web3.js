import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import { createRpcGraphQL, RpcGraphQL } from '../../index';

describe('account loader', () => {
    let rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>;
    let rpcGraphQL: RpcGraphQL;
    // Random address for testing.
    // Not actually used. Just needed for proper query parsing.
    const address = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
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
    describe('cached responses', () => {
        it('coalesces multiple requests for the same account into one', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account1: account(address: $address) {
                        lamports
                    }
                    account2: account(address: $address) {
                        lamports
                    }
                    account3: account(address: $address) {
                        lamports
                    }
                }
            `;
            rpcGraphQL.query(source, { address });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(1);
        });
        it('cache resets on new tick', async () => {
            expect.assertions(1);
            const source = /* GraphQL */ `
                query testQuery($address: Address!) {
                    account(address: $address) {
                        lamports
                    }
                }
            `;
            // Call the query twice
            rpcGraphQL.query(source, { address });
            rpcGraphQL.query(source, { address });
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getAccountInfo).toHaveBeenCalledTimes(2);
        });
    });
});
