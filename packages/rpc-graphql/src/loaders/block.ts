import type { GetBlockApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import { buildCoalescedFetchesByArgsHash, ToFetchMap } from './coalescer';
import { BlockLoader, BlockLoaderArgs, BlockLoaderArgsBase, BlockLoaderValue, cacheKeyFn } from './loader';

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
    return (blockQueryArgs: readonly BlockLoaderArgs[]): ReturnType<BlockLoader['loadMany']> => {
        /**
         * Gather all the blocks that need to be fetched, grouped by slot.
         */
        const blocksToFetch: ToFetchMap<BlockLoaderArgsBase, BlockLoaderValue> = {};
        try {
            return Promise.all(
                blockQueryArgs.map(
                    ({ slot, ...args }) =>
                        new Promise((resolve, reject) => {
                            const blockRecords = (blocksToFetch[slot.toString()] ||= []);
                            // Apply the default commitment level.
                            if (!args.commitment) {
                                args.commitment = 'confirmed';
                            }
                            blockRecords.push({ args, promiseCallback: { reject, resolve } });
                        }),
                ),
            ) as ReturnType<BlockLoader['loadMany']>;
        } finally {
            /**
             * Group together blocks that are fetched with identical args.
             */
            const blockFetchesByArgsHash = buildCoalescedFetchesByArgsHash(blocksToFetch, {
                criteria: (args: BlockLoaderArgsBase) =>
                    args.encoding === undefined && args.transactionDetails !== 'signatures',
                defaults: (args: BlockLoaderArgsBase) => ({
                    ...args,
                    transactionDetails: 'none' as BlockLoaderArgsBase['transactionDetails'],
                }),
                hashOmit: ['encoding', 'transactionDetails'],
            });

            /**
             * For each set of blocks related to some common args, fetch them in the fewest number
             * of network requests.
             */
            Object.values(blockFetchesByArgsHash).map(({ args, fetches: blockCallbacks }) => {
                return Object.entries(blockCallbacks).map(([slot, { callbacks }]) => {
                    return Array.from({ length: 1 }, async () => {
                        try {
                            const result = await resolveBlockUsingRpc({
                                slot: BigInt(slot),
                                ...args,
                            });
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

export function createBlockLoader(rpc: Rpc<GetBlockApi>): BlockLoader {
    const loader = new DataLoader(createBlockBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: args => loader.load({ ...args, maxSupportedTransactionVersion: 0 }),
        loadMany: args => loader.loadMany(args.map(a => ({ ...a, maxSupportedTransactionVersion: 0 }))),
    };
}
