import { BlockResult } from '../../resolvers/block';

export const blockTypeResolvers = {
    Block: {
        transactions: (parent?: BlockResult) =>
            parent?.transactionResults ? Object.values(parent.transactionResults) : null,
    },
};
