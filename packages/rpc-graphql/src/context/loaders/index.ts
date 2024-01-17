export { createAccountLoader } from './account';
export { createBlockLoader } from './block';
export { createProgramAccountsLoader } from './program-accounts';
export { createTransactionLoader } from './transaction';

import { GraphQLResolveInfo } from 'graphql';

import { AccountLoaderArgs } from './account';
import { BlockLoaderArgs } from './block';
import { ProgramAccountsLoaderArgs } from './program-accounts';
import { TransactionLoaderArgs } from './transaction';

type LoadFn<TArgs> = (args: TArgs, info?: GraphQLResolveInfo | undefined) => Promise<unknown>;
type Loader<TArgs> = { load: LoadFn<TArgs> };
export type RpcGraphQLLoaders = {
    account: Loader<AccountLoaderArgs>;
    block: Loader<BlockLoaderArgs>;
    programAccounts: Loader<ProgramAccountsLoaderArgs>;
    transaction: Loader<TransactionLoaderArgs>;
};
