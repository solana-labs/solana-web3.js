import { GraphQLResolveInfo } from 'graphql';

import { createAccountLoader } from './loaders/account.js';
import { createBlockLoader } from './loaders/block.js';
import { createProgramAccountsLoader } from './loaders/program-accounts.js';
import { createTransactionLoader } from './loaders/transaction.js';
import { createRpcGraphQL } from './rpc.js';
import { AccountQueryArgs } from './schema/account.js';
import { BlockQueryArgs } from './schema/block.js';
import { ProgramAccountsQueryArgs } from './schema/program-accounts.js';
import { TransactionQueryArgs } from './schema/transaction.js';

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
