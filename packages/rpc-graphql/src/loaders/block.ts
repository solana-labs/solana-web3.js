import type { Commitment, Slot } from '@solana/rpc-types';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { cacheKeyFn } from './common/cache-key-fn';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedBlock } from './transformers/block';

export type BlockLoaderArgs = {
    slot: Slot;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'jsonParsed';
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    commitment = 'confirmed',
    encoding = 'jsonParsed',
    slot,
    transactionDetails = 'full',
}: BlockLoaderArgs) {
    return {
        commitment,
        encoding,
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
        slot,
        transactionDetails,
    };
}

/* Load a block from the RPC, transform it, then return it */
async function loadBlock(rpc: Rpc, { slot, ...config }: ReturnType<typeof normalizeArgs>) {
    const block = await rpc
        .getBlock(
            slot,
            // @ts-expect-error FIXME: https://github.com/solana-labs/solana-web3.js/issues/1984
            config,
        )
        .send()
        .catch(e => {
            throw e;
        });

    return block === null
        ? { slot }
        : transformLoadedBlock({ block, encoding: config.encoding, transactionDetails: config.transactionDetails });
}

function createBlockBatchLoadFn(rpc: Rpc) {
    const resolveBlockUsingRpc = loadBlock.bind(null, rpc);
    return async (blockQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(blockQueryArgs.map(async args => await resolveBlockUsingRpc(args)));
    };
}

export function createBlockLoader(rpc: Rpc) {
    const loader = new DataLoader(createBlockBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async (args: BlockLoaderArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('slot', info)) {
                // If a user only requests the block's slot,
                // don't call the RPC or the cache
                return { slot: args.slot };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
