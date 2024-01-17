/* eslint-disable @typescript-eslint/no-explicit-any */
import { transformLoadedTransaction } from './transaction';

export function transformLoadedBlock({
    encoding,
    block,
    transactionDetails,
}: {
    block: any;
    encoding: string;
    transactionDetails: string;
}) {
    if (typeof block === 'object' && 'transactions' in block) {
        block.transactions = block.transactions.map((transaction: any) => {
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
