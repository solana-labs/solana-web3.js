import { Address } from '@solana/addresses';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../loaders/account';

export const resolveAccount = (fieldName: string) => {
    return (
        parent: { [x: string]: Address },
        args: AccountLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) =>
        parent[fieldName] === null ? null : context.loaders.account.load({ ...args, address: parent[fieldName] }, info);
};
