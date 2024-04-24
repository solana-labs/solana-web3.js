import type { Rpc, SendTransactionApi } from '@solana/rpc';
import { FullySignedTransaction } from '@solana/transactions';

import { sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT } from './send-transaction-internal';

type SendTransactionWithoutConfirmingFunction = (
    transaction: FullySignedTransaction,
    config: Omit<Parameters<typeof sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT>[0], 'rpc' | 'transaction'>,
) => Promise<void>;

interface SendTransactionWithoutConfirmingFactoryConfig {
    rpc: Rpc<SendTransactionApi>;
}

export function sendTransactionWithoutConfirmingFactory({
    rpc,
}: SendTransactionWithoutConfirmingFactoryConfig): SendTransactionWithoutConfirmingFunction {
    return async function sendTransactionWithoutConfirming(transaction, config) {
        await sendTransaction_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            rpc,
            transaction,
        });
    };
}
