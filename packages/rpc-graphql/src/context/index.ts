import type { graphql } from 'graphql';

import type { createRpcGraphQL } from '..';
import {
    createAccountLoader,
    createBlockLoader,
    createProgramAccountsLoader,
    createTransactionLoader,
    RpcGraphQLLoaders,
} from './loaders';
import { processQuery } from './processor';

export type Rpc = Parameters<typeof createRpcGraphQL>[0];

export interface RpcGraphQLContext {
    loaders: RpcGraphQLLoaders;
}

export async function createSolanaGraphQLContext(
    rpc: Parameters<typeof createRpcGraphQL>[0],
    source: Parameters<typeof graphql>[0]['source'],
    variableValues?: Parameters<typeof graphql>[0]['variableValues'],
): Promise<RpcGraphQLContext> {
    const context = {
        loaders: {
            account: createAccountLoader(rpc),
            block: createBlockLoader(rpc),
            programAccounts: createProgramAccountsLoader(rpc),
            transaction: createTransactionLoader(rpc),
        },
    };
    await processQuery(context, source, variableValues);
    return context;
}
