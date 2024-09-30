import { Rpc, SimulateTransactionApi } from '@solana/rpc';
import {
    CompilableTransactionMessage,
    ITransactionMessageWithFeePayer,
    TransactionMessage,
} from '@solana/transaction-messages';

import { getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT } from './compute-limit-internal';

type ComputeUnitEstimateForTransactionMessageFactoryConfig = Readonly<{
    rpc: Rpc<SimulateTransactionApi>;
}>;
type ComputeUnitEstimateForTransactionMessageFunction = (
    transactionMessage: CompilableTransactionMessage | (ITransactionMessageWithFeePayer & TransactionMessage),
    config?: Omit<
        Parameters<typeof getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'rpc' | 'transactionMessage'
    >,
) => Promise<number>;

export function getComputeUnitEstimateForTransactionMessageFactory({
    rpc,
}: ComputeUnitEstimateForTransactionMessageFactoryConfig): ComputeUnitEstimateForTransactionMessageFunction {
    return async function getComputeUnitEstimateForTransactionMessage(transactionMessage, config) {
        return await getComputeUnitEstimateForTransactionMessage_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            rpc,
            transactionMessage,
        });
    };
}
