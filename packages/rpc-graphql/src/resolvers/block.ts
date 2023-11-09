import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { BlockQueryArgs } from '../schema/block';

export const resolveBlock = (fieldName: string) => {
    return (
        parent: { [x: string]: Slot },
        args: BlockQueryArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined
    ) => (parent[fieldName] === null ? null : context.loadBlock({ ...args, slot: parent[fieldName] }, info));
};
