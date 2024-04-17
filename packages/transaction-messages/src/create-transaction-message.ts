import { NewTransactionVersion, TransactionMessage } from './transaction-message';

type TransactionConfig<TVersion extends NewTransactionVersion> = Readonly<{
    version: TVersion;
}>;

export function createTransactionMessage<TVersion extends NewTransactionVersion>(
    config: TransactionConfig<TVersion>,
): Extract<TransactionMessage, { version: TVersion }>;
export function createTransactionMessage<TVersion extends NewTransactionVersion>({
    version,
}: TransactionConfig<TVersion>): TransactionMessage {
    const out: TransactionMessage = {
        instructions: [],
        version,
    };
    Object.freeze(out);
    return out;
}
