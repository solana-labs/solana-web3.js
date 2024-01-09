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

export const resolveAccountData = () => {
    return (
        parent: { address: Address },
        args: { encoding: AccountLoaderArgs['encoding']; dataSlice?: AccountLoaderArgs['dataSlice'] },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        return (
            context.loaders.account
                .load({ ...args, address: parent.address }, info)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then((account: any) => account.data)
        );
    };
};
