import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { BlockQueryArgs } from '../schema/block';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedBlock } from './transformers/block';

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    commitment = 'confirmed',
    encoding = 'jsonParsed',
    slot,
    transactionDetails = 'full',
}: BlockQueryArgs) {
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
        .getBlock(slot, config as unknown as Parameters<SolanaRpcMethods['getBlock']>[1])
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
    const loader = new DataLoader(createBlockBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: BlockQueryArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('slot', info)) {
                // If a user only requests the block's slot,
                // don't call the RPC or the cache
                return { slot: args.slot };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
