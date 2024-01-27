export const transactionResolvers = {
    Transaction: {
        __resolveType(transaction: { encoding: string }) {
            switch (transaction.encoding) {
                case 'base58':
                    return 'TransactionBase58';
                case 'base64':
                    return 'TransactionBase64';
                default:
                    return 'TransactionParsed';
            }
        },
    },
};
