import { ITransactionWithSignatures } from '.';
import { BaseTransaction } from './types';

export function getUnsignedTransaction<TTransaction extends BaseTransaction>(
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): Omit<ITransactionWithSignatures & TTransaction, keyof ITransactionWithSignatures> | TTransaction {
    if ('signatures' in transaction) {
        // The implication of the lifetime constraint changing is that any existing signatures are invalid.
        const {
            signatures: _, // eslint-disable-line @typescript-eslint/no-unused-vars
            ...unsignedTransaction
        } = transaction;
        return unsignedTransaction;
    } else {
        return transaction;
    }
}
