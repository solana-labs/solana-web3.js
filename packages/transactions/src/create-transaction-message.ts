import { Transaction, TransactionVersion } from './types';

type TransactionMessageConfig<TVersion extends TransactionVersion> = Readonly<{
    version: TVersion;
}>;

export function createTransactionMessage<TVersion extends TransactionVersion>(
    config: TransactionMessageConfig<TVersion>,
): Extract<Transaction, { version: TVersion }>;
export function createTransactionMessage<TVersion extends TransactionVersion>({
    version,
}: TransactionMessageConfig<TVersion>): Transaction {
    const out: Transaction = {
        instructions: [],
        version,
    };
    Object.freeze(out);
    return out;
}
