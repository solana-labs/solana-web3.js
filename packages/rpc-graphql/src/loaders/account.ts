import type { Address } from '@solana/addresses';
import type { DataSlice } from '@solana/rpc-core';
import type { Slot } from '@solana/rpc-types';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { cacheKeyFn } from './common/cache-key-fn';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedAccount } from './transformers/account';

export type AccountLoaderArgs = {
    address: Address;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    commitment?: 'processed' | 'confirmed' | 'finalized';
    minContextSlot?: Slot;
};

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    address,
    commitment = 'confirmed',
    dataSlice,
    encoding = 'jsonParsed',
    minContextSlot,
}: AccountLoaderArgs) {
    return { address, commitment, dataSlice, encoding, minContextSlot };
}

/* Load an account from the RPC, transform it, then return it */
async function loadAccount(rpc: Rpc, { address, ...config }: ReturnType<typeof normalizeArgs>) {
    const account = await rpc
        .getAccountInfo(address, config)
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });
    return account === null ? { address } : transformLoadedAccount({ account, address, encoding: config.encoding });
}

function createAccountBatchLoadFn(rpc: Rpc) {
    const resolveAccountUsingRpc = loadAccount.bind(null, rpc);
    return async (accountQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(accountQueryArgs.map(async args => await resolveAccountUsingRpc(args)));
    };
}

export function createAccountLoader(rpc: Rpc) {
    const loader = new DataLoader(createAccountBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async (args: AccountLoaderArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('address', info)) {
                // If a user only requests the account's address,
                // don't call the RPC or the cache
                return { address: args.address };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
