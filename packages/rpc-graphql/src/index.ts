import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';

import { createSolanaGraphQLContext } from './context';
import { createSolanaGraphQLResolvers } from './resolvers';
import { createSolanaGraphQLTypeDefs } from './schema';

export interface RpcGraphQL {
    query(
        source: Parameters<typeof graphql>[0]['source'],
        variableValues?: Parameters<typeof graphql>[0]['variableValues'],
    ): ReturnType<typeof graphql>;
}

export function createRpcGraphQL(
    rpc: Parameters<typeof createSolanaGraphQLContext>[0],
    config?: Partial<Parameters<typeof createSolanaGraphQLContext>[1]>,
): RpcGraphQL {
    const rpcGraphQLConfig = {
        maxDataSliceByteRange: config?.maxDataSliceByteRange ?? 200,
        maxMultipleAccountsBatchSize: config?.maxMultipleAccountsBatchSize ?? 100,
    };
    const schema = makeExecutableSchema({
        resolvers: createSolanaGraphQLResolvers(),
        typeDefs: createSolanaGraphQLTypeDefs(),
    });
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
