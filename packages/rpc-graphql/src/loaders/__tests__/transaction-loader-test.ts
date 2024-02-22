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
    // Random signature for testing.
    // Not actually used. Just needed for proper query parsing.
    const signature = '67rSZV97NzE4B4ZeFqULqWZcNEV2KwNfDLMzecJmBheZ4sWhudqGAzypoBCKfeLkKtDQBGnkwgdrrFM8ZMaS3pkk';
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
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
            // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
            await Promise.resolve();
            jest.runAllTimers();
            expect(rpc.getTransaction).toHaveBeenCalledTimes(2);
        });
    });
});
