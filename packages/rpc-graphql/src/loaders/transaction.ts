import type { GetTransactionApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import { cacheKeyFn, TransactionLoader, TransactionLoaderArgs, TransactionLoaderValue } from './loader';

function applyDefaultArgs({
    commitment,
    encoding = 'jsonParsed',
    signature,
}: TransactionLoaderArgs): TransactionLoaderArgs {
    return {
        commitment,
        encoding,
        signature,
    };
}

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
    return async (transactionQueryArgs: readonly TransactionLoaderArgs[]) =>
        Promise.all(transactionQueryArgs.map(async args => resolveTransactionUsingRpc(applyDefaultArgs(args))));
}

export function createTransactionLoader(rpc: Rpc<GetTransactionApi>): TransactionLoader {
    const loader = new DataLoader(createTransactionBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async args => loader.load(applyDefaultArgs(args)),
        loadMany: async args => loader.loadMany(args.map(applyDefaultArgs)),
    };
}
