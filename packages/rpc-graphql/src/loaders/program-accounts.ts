/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { ProgramAccountsQueryArgs } from '../schema/program-accounts';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedAccount } from './transformers/account';

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    commitment = 'confirmed',
    dataSlice,
    encoding = 'jsonParsed',
    filters,
    minContextSlot,
    programAddress,
}: ProgramAccountsQueryArgs) {
    return { commitment, dataSlice, encoding, filters, minContextSlot, programAddress };
}

/* Load a program's accounts from the RPC, transform them, then return them */
async function loadProgramAccounts(rpc: Rpc, { programAddress, ...config }: ReturnType<typeof normalizeArgs>) {
    const programAccounts = await rpc
        .getProgramAccounts(programAddress, config as Parameters<SolanaRpcMethods['getProgramAccounts']>[1])
        .send()
        .then(res => {
            if ('value' in res) {
                return res.value as ReturnType<SolanaRpcMethods['getProgramAccounts']>;
            }
            return res as ReturnType<SolanaRpcMethods['getProgramAccounts']>;
        })
        .catch(e => {
            throw e;
        });

    return programAccounts.map(programAccount =>
        transformLoadedAccount({
            account: programAccount.account,
            address: programAccount.pubkey,
            encoding: config.encoding,
        }),
    );
}

function createProgramAccountsBatchLoadFn(rpc: Rpc) {
    const resolveProgramAccountsUsingRpc = loadProgramAccounts.bind(null, rpc);
    return async (programAccountsQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(
            programAccountsQueryArgs.map(async args => await resolveProgramAccountsUsingRpc(args)),
        );
    };
}

export function createProgramAccountsLoader(rpc: Rpc) {
    const loader = new DataLoader(createProgramAccountsBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: ProgramAccountsQueryArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('programAddress', info)) {
                // If a user only requests the program's address,
                // don't call the RPC or the cache
                return { programAddress: args.programAddress };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
