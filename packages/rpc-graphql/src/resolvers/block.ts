import type { Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { BlockLoaderArgs } from '../loaders/block';

export const resolveBlock = (fieldName: string) => {
    return (
        parent: { [x: string]: Slot },
        args: BlockLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => (parent[fieldName] === null ? null : context.loaders.block.load({ ...args, slot: parent[fieldName] }, info));
};
