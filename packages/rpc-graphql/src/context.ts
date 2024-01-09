import { GraphQLResolveInfo } from 'graphql';

import { createAccountLoader } from './loaders/account';
import { AccountLoaderArgs } from './loaders/account';
import { createBlockLoader } from './loaders/block';
import { BlockLoaderArgs } from './loaders/block';
import { createProgramAccountsLoader } from './loaders/program-accounts';
import { ProgramAccountsLoaderArgs } from './loaders/program-accounts';
import { createTransactionLoader } from './loaders/transaction';
import { TransactionLoaderArgs } from './loaders/transaction';
import { createRpcGraphQL } from './rpc';

export type Rpc = Parameters<typeof createRpcGraphQL>[0];

type LoadFn<TArgs> = (args: TArgs, info?: GraphQLResolveInfo | undefined) => Promise<unknown>;
type Loader<TArgs> = { load: LoadFn<TArgs> };
type RpcGraphQLLoaders = {
    account: Loader<AccountLoaderArgs>;
    block: Loader<BlockLoaderArgs>;
    programAccounts: Loader<ProgramAccountsLoaderArgs>;
    transaction: Loader<TransactionLoaderArgs>;
};

export interface RpcGraphQLContext {
    loaders: RpcGraphQLLoaders;
    rpc: Rpc;
}

export function createSolanaGraphQLContext(rpc: Rpc): RpcGraphQLContext {
    return {
        loaders: {
            account: createAccountLoader(rpc),
            block: createBlockLoader(rpc),
            programAccounts: createProgramAccountsLoader(rpc),
            transaction: createTransactionLoader(rpc),
        },
        rpc,
    };
}
