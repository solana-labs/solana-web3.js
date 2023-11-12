import { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import { GetBlockApi } from '@solana/rpc-core/dist/types/rpc-methods/getBlock';
import { GetProgramAccountsApi } from '@solana/rpc-core/dist/types/rpc-methods/getProgramAccounts';
import { GetTransactionApi } from '@solana/rpc-core/dist/types/rpc-methods/getTransaction';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
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
