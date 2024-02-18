import { GetBlockApi } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-types';
import DataLoader from 'dataloader';

import { BlockLoader, BlockLoaderArgs, BlockLoaderValue, cacheKeyFn } from './loader';

function applyDefaultArgs({
    slot,
    commitment,
    encoding = 'jsonParsed',
    maxSupportedTransactionVersion = 0,
    rewards,
    transactionDetails = 'full',
}: BlockLoaderArgs): BlockLoaderArgs {
    return {
        commitment,
        encoding,
        maxSupportedTransactionVersion,
        rewards,
        slot,
        transactionDetails,
    };
}

async function loadBlock(rpc: Rpc<GetBlockApi>, { slot, ...config }: BlockLoaderArgs): Promise<BlockLoaderValue> {
    // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
    return await rpc
        .getBlock(
            slot,
            // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
            config,
        )
        .send();
}

function createBlockBatchLoadFn(rpc: Rpc<GetBlockApi>) {
    const resolveBlockUsingRpc = loadBlock.bind(null, rpc);
    return async (blockQueryArgs: readonly BlockLoaderArgs[]) => {
        return await Promise.all(blockQueryArgs.map(async args => await resolveBlockUsingRpc(applyDefaultArgs(args))));
    };
}

export function createBlockLoader(rpc: Rpc<GetBlockApi>): BlockLoader {
    const loader = new DataLoader(createBlockBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async args => loader.load(applyDefaultArgs(args)),
    };
}
