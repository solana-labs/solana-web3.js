import { Address } from '@solana/addresses';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context.js';
import { AccountQueryArgs } from '../schema/account.js';

export const resolveAccount = (fieldName: string) => {
    return (
        parent: { [x: string]: Address },
        args: AccountQueryArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined
    ) =>
        parent[fieldName] === null ? null : context.loaders.account.load({ ...args, address: parent[fieldName] }, info);
};
