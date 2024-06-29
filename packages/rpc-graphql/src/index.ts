import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';

import { createSolanaGraphQLContext } from './context';
import { createSolanaGraphQLTypeDefs } from './schema/type-defs';
import { createSolanaGraphQLTypeResolvers } from './schema/type-resolvers';

export interface RpcGraphQL {
    query(
        source: Parameters<typeof graphql>[0]['source'],
        variableValues?: Parameters<typeof graphql>[0]['variableValues'],
    ): ReturnType<typeof graphql>;
}

/**
 * Create a GraphQL RPC client resolver.
 *
 * @param rpc       Solana RPC client.
 * @param schema    GraphQL schema.
 * @param config    Optional GraphQL resolver configurations.
 * @returns         GraphQL RPC client resolver.
 */
export function createRpcGraphQL(
    rpc: Parameters<typeof createSolanaGraphQLContext>[0],
    schema: ReturnType<typeof makeExecutableSchema>,
    config?: Partial<Parameters<typeof createSolanaGraphQLContext>[1]>,
): RpcGraphQL {
    const rpcGraphQLConfig = {
        maxDataSliceByteRange: config?.maxDataSliceByteRange ?? 200,
        maxMultipleAccountsBatchSize: config?.maxMultipleAccountsBatchSize ?? 100,
    };
    return {
        async query(source, variableValues?) {
            const contextValue = createSolanaGraphQLContext(rpc, rpcGraphQLConfig);
            return await graphql({
                contextValue,
                schema,
                source,
                variableValues,
            });
        },
    };
}

/**
 * Create a Solana GraphQL RPC client resolver.
 *
 * Configures the client resolver to use the default Solana GraphQL schema.
 *
 * @param rpc       Solana RPC client.
 * @param config    Optional GraphQL resolver configurations.
 * @returns         Solana GraphQL RPC client resolver.
 */
export function createSolanaRpcGraphQL(
    rpc: Parameters<typeof createSolanaGraphQLContext>[0],
    config?: Partial<Parameters<typeof createSolanaGraphQLContext>[1]>,
): RpcGraphQL {
    const schema = makeExecutableSchema({
        resolvers: createSolanaGraphQLTypeResolvers(),
        typeDefs: createSolanaGraphQLTypeDefs(),
    });
    return createRpcGraphQL(rpc, schema, config);
}

export { createSolanaGraphQLTypeDefs, createSolanaGraphQLTypeResolvers };
