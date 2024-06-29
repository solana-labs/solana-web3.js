import { resolveTransactionData } from '../../resolvers/transaction';

export const transactionTypeResolvers = {
    Transaction: {
        data: resolveTransactionData(),
    },
};
