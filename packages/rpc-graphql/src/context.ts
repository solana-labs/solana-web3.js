import type {
    GetAccountInfoApi,
    GetBlockApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetTransactionApi,
    Rpc,
} from '@solana/rpc';

import {
    createAccountLoader,
    createBlockLoader,
    createProgramAccountsLoader,
    createTransactionLoader,
    RpcGraphQLLoaders,
} from './loaders';

type Config = {
    /**
     * Maximum number of acceptable bytes to waste before splitting two
     * `dataSlice` requests into two requests.
     */
    maxDataSliceByteRange: number;
    /**
     * Maximum number of accounts to fetch in a single batch.
     * See https://docs.solana.com/api/http#getmultipleaccounts.
     */
    maxMultipleAccountsBatchSize: number;
};

export interface RpcGraphQLContext {
    loaders: RpcGraphQLLoaders;
}

export function createSolanaGraphQLContext(
    rpc: Rpc<GetAccountInfoApi & GetBlockApi & GetMultipleAccountsApi & GetProgramAccountsApi & GetTransactionApi>,
    config: Config,
): RpcGraphQLContext {
    return {
        loaders: {
            account: createAccountLoader(rpc, config),
            block: createBlockLoader(rpc),
            programAccounts: createProgramAccountsLoader(rpc, config),
            transaction: createTransactionLoader(rpc),
        },
    };
}
