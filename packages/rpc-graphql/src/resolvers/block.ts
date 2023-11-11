import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { GraphQLCache } from '../cache';
import { BlockQueryArgs } from '../schema/block';

export async function resolveBlock(
    { slot, encoding = 'jsonParsed', ...config }: BlockQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const requestConfig = { encoding, ...config };

    const cached = cache.get(slot, config);
    if (cached !== null) {
        return cached;
    }

    const block = await rpc
        .getBlock(slot, requestConfig as unknown as Parameters<SolanaRpcMethods['getBlock']>[1])
        .send();

    if (block === null) {
        return null;
    }

    cache.insert(slot, config, block);

    return block;
}
