import type { createRpcGraphQL } from './index';
import {
    createAccountLoader,
    createBlockLoader,
    createProgramAccountsLoader,
    createTransactionLoader,
    RpcGraphQLLoaders,
} from './loaders';

export type Rpc = Parameters<typeof createRpcGraphQL>[0];

export interface RpcGraphQLContext {
    loaders: RpcGraphQLLoaders;
}

export function createSolanaGraphQLContext(rpc: Rpc): RpcGraphQLContext {
    return {
        loaders: {
            account: createAccountLoader(rpc),
            block: createBlockLoader(rpc),
            programAccounts: createProgramAccountsLoader(rpc),
            transaction: createTransactionLoader(rpc),
        },
    };
}
