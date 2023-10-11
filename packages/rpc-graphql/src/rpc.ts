import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { graphql, GraphQLObjectType, GraphQLSchema, Source } from 'graphql';

import { createSolanaGraphQLContext, RpcGraphQLContext } from './context';
import { accountQuery, accountTypes } from './schema/account';

export interface RpcGraphQL {
    context: RpcGraphQLContext;
    query(
        source: string | Source,
        variableValues?: { readonly [variable: string]: unknown }
    ): ReturnType<typeof graphql>;
    schema: GraphQLSchema;
}

export function createRpcGraphQL(rpc: Rpc<SolanaRpcMethods>): RpcGraphQL {
    const context = createSolanaGraphQLContext(rpc);
    const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            fields: {
                ...accountQuery,
            },
            name: 'RootQuery',
        }),
        types: [...accountTypes],
    });
    return {
        context,
        async query(source: string | Source, variableValues?: { readonly [variable: string]: unknown }) {
            const result = await graphql({
                contextValue: this.context,
                schema: this.schema,
                source,
                variableValues,
            });
            this.context.cache.flush();
            return result;
        },
        schema,
    };
}
