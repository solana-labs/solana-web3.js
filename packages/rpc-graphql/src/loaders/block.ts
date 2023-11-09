import { SolanaRpcMethods } from '@solana/rpc-core';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import type { Rpc } from '../context';
import { BlockQueryArgs } from '../schema/block';

export async function loadBlock(
    { slot, encoding = 'jsonParsed', ...config }: BlockQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc,
    _info?: GraphQLResolveInfo
) {
    const requestConfig = {
        encoding,
        ...config,
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
    };

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
