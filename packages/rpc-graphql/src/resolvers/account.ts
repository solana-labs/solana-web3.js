import { Address } from '@solana/addresses';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../loaders/account';
import { transformParsedAccountData } from '../loaders/transformers/account';

export const resolveAccount = (fieldName: string) => {
    return (
        parent: { [x: string]: Address },
        args: AccountLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        return parent[fieldName] == null
            ? null
            : context.loaders.account.load({ ...args, address: parent[fieldName] }, info);
    };
};

export const resolveAccountData = () => {
    return async (
        parent: { address: Address },
        args: { encoding: AccountLoaderArgs['encoding']; dataSlice?: AccountLoaderArgs['dataSlice'] },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const account: any = await context.loaders.account.load({ ...args, address: parent.address }, info);
        const data = account.data;
        if (data.parsed) {
            return transformParsedAccountData(data);
        } else {
            return data[0] === '' ? null : data[0];
        }
    };
};
