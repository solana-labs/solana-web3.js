import type { GetAccountInfoApi, GetBlockApi, GetProgramAccountsApi, GetTransactionApi } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-transport';
import { graphql, GraphQLSchema, Source } from 'graphql';

import { createSolanaGraphQLContext, RpcGraphQLContext } from './context';
import { createSolanaGraphQLSchema } from './schema';

type RpcMethods = GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi;

export interface RpcGraphQL {
    context: RpcGraphQLContext;
    query(
        source: string | Source,
        variableValues?: { readonly [variable: string]: unknown }
    ): ReturnType<typeof graphql>;
    schema: GraphQLSchema;
}

export function createRpcGraphQL(rpc: Rpc<RpcMethods>): RpcGraphQL {
    const context = createSolanaGraphQLContext(rpc);
    const schema = createSolanaGraphQLSchema();
    return {
        context,
        async query(source: string | Source, variableValues?: { readonly [variable: string]: unknown }) {
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
