import { BlockResult, resolveBlock } from '../../resolvers/block';

export const blockTypeResolvers = {
    Block: {
        parentSlot: resolveBlock('parentSlot'),
        transactions: (parent?: BlockResult) =>
            parent?.transactionResults ? Object.values(parent.transactionResults) : null,
    },
};
