import { GraphQLResolveInfo } from 'graphql';

import { createAccountLoader } from './loaders/account';
import { createBlockLoader } from './loaders/block';
import { createProgramAccountsLoader } from './loaders/program-accounts';
import { createTransactionLoader } from './loaders/transaction';
import { createRpcGraphQL } from './rpc';
import { AccountQueryArgs } from './schema/account';
import { BlockQueryArgs } from './schema/block';
import { ProgramAccountsQueryArgs } from './schema/program-accounts';
import { TransactionQueryArgs } from './schema/transaction';

export type Rpc = Parameters<typeof createRpcGraphQL>[0];

type LoadFn<TArgs> = (args: TArgs, info?: GraphQLResolveInfo | undefined) => Promise<unknown>;
type Loader<TArgs> = { load: LoadFn<TArgs> };
type RpcGraphQLLoaders = {
    account: Loader<AccountQueryArgs>;
    block: Loader<BlockQueryArgs>;
    programAccounts: Loader<ProgramAccountsQueryArgs>;
    transaction: Loader<TransactionQueryArgs>;
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
