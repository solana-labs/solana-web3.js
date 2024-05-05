import { resolveBlock } from '../../resolvers/block';
import { resolveTransactionData } from '../../resolvers/transaction';

export const transactionTypeResolvers = {
    Transaction: {
        data: resolveTransactionData(),
        slot: resolveBlock('slot'),
    },
};
