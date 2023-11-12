import { GraphQLResolveInfo } from 'graphql';

import { createGraphQLCache, GraphQLCache } from './cache';
import { createAccountLoader } from './loaders/account';
import { createBlockLoader } from './loaders/block';
import { loadProgramAccounts } from './loaders/program-accounts';
import { createTransactionLoader } from './loaders/transaction';
import { createRpcGraphQL } from './rpc';
import { AccountQueryArgs } from './schema/account';
import { BlockQueryArgs } from './schema/block';
import { ProgramAccountsQueryArgs } from './schema/program-accounts';
import { TransactionQueryArgs } from './schema/transaction';

export type Rpc = Parameters<typeof createRpcGraphQL>[0];

type Loader<TArgs> = {
    load: (args: TArgs, info?: GraphQLResolveInfo | undefined) => Promise<unknown>;
};
type Loaders = {
    account: Loader<AccountQueryArgs>;
    block: Loader<BlockQueryArgs>;
    transaction: Loader<TransactionQueryArgs>;
};

export interface RpcGraphQLContext {
    cache: GraphQLCache;
    loadProgramAccounts(
        args: ProgramAccountsQueryArgs,
        info?: GraphQLResolveInfo
    ): ReturnType<typeof loadProgramAccounts>;
    loaders: Loaders;
    rpc: Rpc;
}

function createRpcGraphQLLoaders(rpc: Rpc): Loaders {
    return {
        account: createAccountLoader(rpc),
        block: createBlockLoader(rpc),
        transaction: createTransactionLoader(rpc),
    };
}

export function createSolanaGraphQLContext(rpc: Rpc): RpcGraphQLContext {
    const cache = createGraphQLCache();
    return {
        cache,
        loadProgramAccounts(args, info?) {
            return loadProgramAccounts(args, this.cache, this.rpc, info);
        },
        loaders: createRpcGraphQLLoaders(rpc),
        rpc,
    };
}
