import { GetProgramAccountsApi } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-types';
import DataLoader from 'dataloader';

import { cacheKeyFn, ProgramAccountsLoader, ProgramAccountsLoaderArgs, ProgramAccountsLoaderValue } from './loader';

function applyDefaultArgs({
    commitment,
    dataSlice,
    encoding = 'jsonParsed',
    filters,
    minContextSlot,
    programAddress,
}: ProgramAccountsLoaderArgs): ProgramAccountsLoaderArgs {
    return {
        commitment,
        dataSlice,
        encoding,
        filters,
        minContextSlot,
        programAddress,
    };
}

async function loadProgramAccounts(
    rpc: Rpc<GetProgramAccountsApi>,
    { programAddress, ...config }: ProgramAccountsLoaderArgs,
): Promise<ProgramAccountsLoaderValue> {
    // @ts-expect-error FIX ME: https://github.com/solana-labs/solana-web3.js/pull/2052
    return await rpc
        .getProgramAccounts(
            programAddress,
            // @ts-expect-error FIX ME: https://github.com/solana-labs/solana-web3.js/pull/2052
            config,
        )
        .send();
}

function createProgramAccountsBatchLoadFn(rpc: Rpc<GetProgramAccountsApi>) {
    const resolveProgramAccountsUsingRpc = loadProgramAccounts.bind(null, rpc);
    return async (programAccountsQueryArgs: readonly ProgramAccountsLoaderArgs[]) => {
        return await Promise.all(
            programAccountsQueryArgs.map(async args => await resolveProgramAccountsUsingRpc(applyDefaultArgs(args))),
        );
    };
}

export function createProgramAccountsLoader(rpc: Rpc<GetProgramAccountsApi>): ProgramAccountsLoader {
    const loader = new DataLoader(createProgramAccountsBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async args => loader.load(applyDefaultArgs(args)),
    };
}
