import type { GetTransactionApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import { buildCoalescedFetchesByArgsHash, ToFetchMap } from './coalescer';
import {
    cacheKeyFn,
    TransactionLoader,
    TransactionLoaderArgs,
    TransactionLoaderArgsBase,
    TransactionLoaderValue,
} from './loader';

async function loadTransaction(
    rpc: Rpc<GetTransactionApi>,
    { signature, ...config }: TransactionLoaderArgs,
): Promise<TransactionLoaderValue> {
    // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
    return await rpc
        .getTransaction(
            signature,
            // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
            config,
        )
        .send();
}

function createTransactionBatchLoadFn(rpc: Rpc<GetTransactionApi>) {
    const resolveTransactionUsingRpc = loadTransaction.bind(null, rpc);
    return (transactionQueryArgs: readonly TransactionLoaderArgs[]): ReturnType<TransactionLoader['loadMany']> => {
        /**
         * Gather all the transactions that need to be fetched, grouped by signature.
         */
        const transactionsToFetch: ToFetchMap<TransactionLoaderArgsBase, TransactionLoaderValue> = {};
        try {
            return Promise.all(
                transactionQueryArgs.map(
                    ({ signature, ...args }) =>
                        new Promise((resolve, reject) => {
                            const transactionRecords = (transactionsToFetch[signature] ||= []);
                            // Apply the default commitment level.
                            if (!args.commitment) {
                                args.commitment = 'confirmed';
                            }
                            transactionRecords.push({ args, promiseCallback: { reject, resolve } });
                        }),
                ),
            ) as ReturnType<TransactionLoader['loadMany']>;
        } finally {
            /**
             * Group together transactions that are fetched with identical args.
             */
            const transactionFetchesByArgsHash = buildCoalescedFetchesByArgsHash(transactionsToFetch, {
                criteria: (args: TransactionLoaderArgsBase) => args.encoding === undefined,
                defaults: (args: TransactionLoaderArgsBase) => ({ ...args, encoding: 'base64' }),
                hashOmit: ['encoding'],
            });

            /**
             * For each set of transactions related to some common args, fetch them in the fewest number
             * of network requests.
             */
            Object.values(transactionFetchesByArgsHash).map(({ args, fetches: transactionCallbacks }) => {
                return Object.entries(transactionCallbacks).map(([signature, { callbacks }]) => {
                    return Array.from({ length: 1 }, async () => {
                        try {
                            const result = await resolveTransactionUsingRpc({
                                signature,
                                ...args,
                            } as TransactionLoaderArgs);
                            callbacks.forEach(c => c.resolve(result));
                        } catch (e) {
                            callbacks.forEach(c => c.reject(e));
                        }
                    });
                });
            });
        }
    };
}

export function createTransactionLoader(rpc: Rpc<GetTransactionApi>): TransactionLoader {
    const loader = new DataLoader(createTransactionBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: args => loader.load(args),
        loadMany: args => loader.loadMany(args),
    };
}
