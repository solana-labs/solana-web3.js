import type { Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { BlockLoaderArgs } from '../loaders';
import { onlyFieldsRequested } from './resolve-info';
import { transformLoadedTransaction } from './transaction';

export function transformLoadedBlock({
    block,
    encoding = 'jsonParsed',
    transactionDetails = 'full',
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: any;
    encoding: BlockLoaderArgs['encoding'];
    transactionDetails: BlockLoaderArgs['transactionDetails'];
}) {
    const transformedBlock = block;
    if (typeof block === 'object' && 'transactions' in block) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformedBlock.transactions = block.transactions.map((transaction: any) => {
            if (transactionDetails === 'accounts') {
                return {
                    data: transaction.transaction,
                    meta: transaction.meta,
                    version: transaction.version,
                };
            } else {
                return transformLoadedTransaction({ encoding, transaction });
            }
        });
    }
    block.encoding = encoding;
    block.transactionDetails = transactionDetails;
    return block;
}

export const resolveBlock = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Slot },
        args: BlockLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ) => {
        const slot = fieldName ? parent[fieldName] : args.slot;
        if (!slot) {
            return null;
        }
        if (onlyFieldsRequested(['slot'], info)) {
            return { slot };
        }
        const block = await context.loaders.block.load({ ...args, slot });
        if (block === null) {
            return null;
        }
        const { encoding, transactionDetails } = args;
        return transformLoadedBlock({ block, encoding, transactionDetails });
    };
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
