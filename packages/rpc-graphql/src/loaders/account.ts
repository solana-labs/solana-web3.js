import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { AccountQueryArgs } from '../schema/account';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedAccount } from './transformers/account';

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    address,
    commitment = 'confirmed',
    dataSlice,
    encoding = 'jsonParsed',
    minContextSlot,
}: AccountQueryArgs) {
    return { address, commitment, dataSlice, encoding, minContextSlot };
}

/* Load an account from the RPC, transform it, then return it */
async function loadAccount(rpc: Rpc, { address, ...config }: ReturnType<typeof normalizeArgs>) {
    const account = await rpc
        .getAccountInfo(address, config as Parameters<SolanaRpcMethods['getAccountInfo']>[1])
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
    const loader = new DataLoader(createAccountBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: AccountQueryArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('address', info)) {
                // If a user only requests the account's address,
                // don't call the RPC or the cache
                return { address: args.address };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
