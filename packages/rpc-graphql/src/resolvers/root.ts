import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../context/loaders/account';
import { BlockLoaderArgs } from '../context/loaders/block';
import { ProgramAccountsLoaderArgs } from '../context/loaders/program-accounts';
import { TransactionLoaderArgs } from '../context/loaders/transaction';

export const rootResolvers = {
    Query: {
        account(_: unknown, args: AccountLoaderArgs, context: RpcGraphQLContext, info?: GraphQLResolveInfo) {
            return context.loaders.account.load(args, info);
        },
        block(_: unknown, args: BlockLoaderArgs, context: RpcGraphQLContext, info?: GraphQLResolveInfo) {
            return context.loaders.block.load(args, info);
        },
        programAccounts(
            _: unknown,
            args: ProgramAccountsLoaderArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo,
        ) {
            return context.loaders.programAccounts.load(args, info);
        },
        transaction(_: unknown, args: TransactionLoaderArgs, context: RpcGraphQLContext, info?: GraphQLResolveInfo) {
            return context.loaders.transaction.load(args, info);
        },
    },
};
