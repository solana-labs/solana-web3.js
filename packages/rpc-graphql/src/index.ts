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

type Config = {
    /**
     * Maximum number of acceptable bytes to waste before splitting two
     * `dataSlice` requests into two requests.
     */
    maxDataSliceByteRange?: number;
    /**
     * Maximum number of accounts to fetch in a single batch.
     * See https://docs.solana.com/api/http#getmultipleaccounts.
     */
    maxMultipleAccountsBatchSize?: number;
    /**
     * Resolvers for custom queries to extend the default queries.
     */
    queryResolvers?: Parameters<typeof makeExecutableSchema>[0]['resolvers'];
    /**
     * Custom type definitions to extend the default type definitions in
     * the GraphQL schema.
     *
     * Note: custom type definitions may not override existing type
     * definitions, but may implement existing interfaces.
     *
     * These type definitions should correspond to any custom resolvers
     * provided in `resolvers`.
     */
    typeDefs?: Parameters<typeof makeExecutableSchema>[0]['typeDefs'];
    /**
     * Custom type resolvers to extend the default resolvers.
     *
     * These resolvers should correspond to any custom type definitions
     * provided in `typeDefs`.
     */
    typeResolvers?: Parameters<typeof makeExecutableSchema>[0]['resolvers'];
};

export function createRpcGraphQL(rpc: Parameters<typeof createSolanaGraphQLContext>[0], config?: Config): RpcGraphQL {
    const { maxDataSliceByteRange, maxMultipleAccountsBatchSize, queryResolvers, typeResolvers, typeDefs } =
        config ?? {};
    const rpcGraphQLConfig = {
        maxDataSliceByteRange: maxDataSliceByteRange ?? 200,
        maxMultipleAccountsBatchSize: maxMultipleAccountsBatchSize ?? 100,
    };
    const schema = makeExecutableSchema({
        resolvers: createSolanaGraphQLResolvers({ queryResolvers, typeResolvers }),
        typeDefs: createSolanaGraphQLTypeDefs({ typeDefs }),
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

// Export resolvers to be used to build custom resolvers.
export { resolveAccount } from './resolvers/account';
export { resolveBlock } from './resolvers/block';
export { resolveTransaction } from './resolvers/transaction';
