import { GetAccountInfoApi } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-types';
import DataLoader from 'dataloader';

import { AccountLoader, AccountLoaderArgs, AccountLoaderValue, cacheKeyFn } from './loader';

function applyDefaultArgs({
    address,
    commitment,
    dataSlice,
    encoding = 'jsonParsed',
    minContextSlot,
}: AccountLoaderArgs): AccountLoaderArgs {
    return {
        address,
        commitment,
        dataSlice,
        encoding,
        minContextSlot,
    };
}

async function loadAccount(
    rpc: Rpc<GetAccountInfoApi>,
    { address, ...config }: AccountLoaderArgs,
): Promise<AccountLoaderValue> {
    return await rpc
        .getAccountInfo(address, config)
        .send()
        .then(res => res.value);
}

function createAccountBatchLoadFn(rpc: Rpc<GetAccountInfoApi>) {
    const resolveAccountUsingRpc = loadAccount.bind(null, rpc);
    return async (accountQueryArgs: readonly AccountLoaderArgs[]) => {
        return await Promise.all(
            accountQueryArgs.map(async args => await resolveAccountUsingRpc(applyDefaultArgs(args))),
        );
    };
}

export function createAccountLoader(rpc: Rpc<GetAccountInfoApi>): AccountLoader {
    const loader = new DataLoader(createAccountBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async args => loader.load(applyDefaultArgs(args)),
    };
}
