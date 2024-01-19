import { makeExecutableSchema } from '@graphql-tools/schema';
import type { GetAccountInfoApi, GetBlockApi, GetProgramAccountsApi, GetTransactionApi } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-transport';
import { graphql } from 'graphql';

import { createSolanaGraphQLContext } from './context';
import { createSolanaGraphQLResolvers } from './resolvers';
import { createSolanaGraphQLTypeDefs } from './schema';

type RpcMethods = GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi;

export interface RpcGraphQL {
    query(
        source: Parameters<typeof graphql>[0]['source'],
        variableValues?: Parameters<typeof graphql>[0]['variableValues'],
    ): ReturnType<typeof graphql>;
}

export function createRpcGraphQL(rpc: Rpc<RpcMethods>): RpcGraphQL {
    return {
        async query(source, variableValues?) {
            const contextValue = await createSolanaGraphQLContext(rpc, source, variableValues);
            const schema = makeExecutableSchema({
                resolvers: createSolanaGraphQLResolvers(),
                typeDefs: createSolanaGraphQLTypeDefs(),
            });
            return graphql({
                contextValue,
                schema,
                source,
                variableValues,
            });
        },
    };
}
