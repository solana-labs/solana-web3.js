import { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import { GetBlockApi } from '@solana/rpc-core/dist/types/rpc-methods/getBlock';
import { GetProgramAccountsApi } from '@solana/rpc-core/dist/types/rpc-methods/getProgramAccounts';
import { GetTransactionApi } from '@solana/rpc-core/dist/types/rpc-methods/getTransaction';
import { SimulateTransactionApi } from '@solana/rpc-core/dist/types/rpc-methods/simulateTransaction';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { graphql, GraphQLSchema, Source } from 'graphql';

import { createSolanaGraphQLContext, RpcGraphQLContext } from './context';
import { createSolanaGraphQLSchema } from './schema';
import { ProgramAstSource } from './schema/ast/types';

type RpcMethods = GetAccountInfoApi & GetBlockApi & GetProgramAccountsApi & GetTransactionApi & SimulateTransactionApi;

export interface RpcGraphQL {
    context: RpcGraphQLContext;
    query(
        source: string | Source,
        variableValues?: { readonly [variable: string]: unknown }
    ): ReturnType<typeof graphql>;
    schema: GraphQLSchema;
}

type RpcGraphQLConfig = Readonly<{
    programAst: ProgramAstSource[];
}>;

export function createRpcGraphQL(rpc: Rpc<RpcMethods>, config?: RpcGraphQLConfig): RpcGraphQL {
    const context = createSolanaGraphQLContext(rpc);
    const schema = createSolanaGraphQLSchema({ ...config });
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
