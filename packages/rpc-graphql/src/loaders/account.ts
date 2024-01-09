import { Address } from '@solana/addresses';
import { DataSlice, Slot, SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { cacheKeyFn } from './common/cache-key-fn';
import { onlyPresentFieldRequested } from './common/resolve-info';

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
    if (
        address === 'Feature111111111111111111111111111111111111' ||
        address === 'NativeLoader1111111111111111111111111111111' ||
        address === 'Sysvar1nstructions1111111111111111111111111'
    ) {
        // This is a synthetic account; `getAccountInfo()` would return `null`.
        return {
            address,
            data: ['', 'base64'],
            executable: false,
            lamports: 0n,
            owner: '11111111111111111111111111111111',
            rentEpoch: 18_446_744_073_709_552_000n,
            space: 0n,
        };
    }
    const account = await rpc
        .getAccountInfo(address, config as Parameters<SolanaRpcMethods['getAccountInfo']>[1])
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });
    if (!account || account.lamports <= 0n) {
        return null;
    }
    return {
        ...account,
        address,
    };
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
