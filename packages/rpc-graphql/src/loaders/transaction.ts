import { GetTransactionApi } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-types';
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
    return await rpc.getTransaction(signature, config).send();
}

function createTransactionBatchLoadFn(rpc: Rpc<GetTransactionApi>) {
    const resolveTransactionUsingRpc = loadTransaction.bind(null, rpc);
    return async (transactionQueryArgs: readonly TransactionLoaderArgs[]) => {
        return await Promise.all(
            transactionQueryArgs.map(async args => await resolveTransactionUsingRpc(applyDefaultArgs(args))),
        );
    };
}

export function createTransactionLoader(rpc: Rpc<GetTransactionApi>): TransactionLoader {
    const loader = new DataLoader(createTransactionBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async args => loader.load(applyDefaultArgs(args)),
    };
}
