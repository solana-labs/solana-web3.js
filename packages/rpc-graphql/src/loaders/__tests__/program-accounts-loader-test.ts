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
    const programAddress = 'DXngmJfjurhnAwbMPgpUGPH6qNvetCKRJ6PiD4ag4PTj';
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getProgramAccounts).toHaveBeenCalledTimes(2);
        });
    });
});
