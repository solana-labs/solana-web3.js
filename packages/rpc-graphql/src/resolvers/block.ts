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

export const blockResolvers = {
    Block: {
        __resolveType(block: { transactionDetails: string }) {
            switch (block.transactionDetails) {
                case 'accounts':
                    return 'BlockWithAccounts';
                case 'none':
                    return 'BlockWithNone';
                case 'signatures':
                    return 'BlockWithSignatures';
                default:
                    return 'BlockWithFull';
            }
        },
    },
};
