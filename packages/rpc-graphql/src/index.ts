import type { GetAccountInfoApi, GetBlockApi, GetProgramAccountsApi, GetTransactionApi } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-types';
import { graphql, GraphQLSchema } from 'graphql';

import { createSolanaGraphQLContext, RpcGraphQLContext } from './context';
import { createSolanaGraphQLSchema } from './schema';

type RpcMethods = GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi;

export interface RpcGraphQL {
    context: RpcGraphQLContext;
    query(
        source: Parameters<typeof graphql>[0]['source'],
        variableValues?: Parameters<typeof graphql>[0]['variableValues'],
    ): ReturnType<typeof graphql>;
    schema: GraphQLSchema;
}

export function createRpcGraphQL(rpc: Rpc<RpcMethods>): RpcGraphQL {
    const context = createSolanaGraphQLContext(rpc);
    const schema = createSolanaGraphQLSchema();
    return {
        context,
        async query(source, variableValues?) {
            return graphql({
                contextValue: this.context,
                schema: this.schema,
                source,
                variableValues,
            });
        },
        schema,
    };
}
