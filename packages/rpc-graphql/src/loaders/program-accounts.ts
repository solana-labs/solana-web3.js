/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { ProgramAccountsQueryArgs } from '../schema/program-accounts';
import { refineJsonParsedAccountData } from './account';
import { onlyPresentFieldRequested } from './common/resolve-info';

function normalizeArgs(args: ProgramAccountsQueryArgs) {
    const { commitment, dataSlice, encoding, filters, minContextSlot, programAddress } = args;
    return {
        commitment: commitment ?? 'confirmed',
        dataSlice,
        encoding: encoding ?? 'jsonParsed',
        filters,
        minContextSlot,
        programAddress,
    };
}

function processQueryResponse({ encoding, programAccounts }: { encoding: string; programAccounts: any[] }) {
    return programAccounts.map(programAccount => {
        const [refinedData, responseEncoding] = Array.isArray(programAccount.account.data)
            ? encoding === 'jsonParsed'
                ? [programAccount.account.data[0], 'base64']
                : [programAccount.account.data[0], encoding]
            : [refineJsonParsedAccountData(programAccount.account.data), 'jsonParsed'];
        const pubkey = programAccount.pubkey;
        const responseBase = {
            ...programAccount.account,
            address: pubkey,
            encoding: responseEncoding,
        };
        return typeof refinedData === 'object' && 'meta' in refinedData
            ? {
                  ...responseBase,
                  data: refinedData.data,
                  meta: refinedData.meta,
              }
            : {
                  ...responseBase,
                  data: refinedData,
              };
    });
}

export async function loadProgramAccounts(rpc: Rpc, { programAddress, ...config }: ReturnType<typeof normalizeArgs>) {
    const { encoding } = config;

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

    const queryResponse = processQueryResponse({ encoding, programAccounts });

    return queryResponse;
}

function createProgramAccountsBatchLoadFn(rpc: Rpc) {
    const resolveProgramAccountsUsingRpc = loadProgramAccounts.bind(null, rpc);
    return async (programAccountsQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(
            programAccountsQueryArgs.map(async args => await resolveProgramAccountsUsingRpc(args))
        );
    };
}

export function createProgramAccountsLoader(rpc: Rpc) {
    const loader = new DataLoader(createProgramAccountsBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: ProgramAccountsQueryArgs, info?: GraphQLResolveInfo) => {
            // If a user only requests the program's address, don't call the RPC or the cache
            if (onlyPresentFieldRequested('programAddress', info)) {
                return { programAddress: args.programAddress };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
