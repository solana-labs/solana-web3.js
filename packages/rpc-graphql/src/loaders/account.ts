/* eslint-disable @typescript-eslint/no-explicit-any */
import { Address } from '@solana/addresses';
import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { AccountQueryArgs } from '../schema/account';
import { onlyPresentFieldRequested } from './common/resolve-info';

function normalizeArgs(args: AccountQueryArgs) {
    const { address, commitment, dataSlice, encoding, minContextSlot } = args;
    return {
        address,
        commitment: commitment ?? 'confirmed',
        dataSlice,
        encoding: encoding ?? 'jsonParsed',
        minContextSlot,
    };
}

export function refineJsonParsedAccountData(jsonParsedAccountData: any) {
    const meta = {
        program: jsonParsedAccountData.program,
        space: jsonParsedAccountData.space,
        type: jsonParsedAccountData.parsed.type,
    };
    const data = jsonParsedAccountData.parsed.info;
    return { data, meta };
}

function processQueryResponse({ address, account, encoding }: { address: Address; account: any; encoding: string }) {
    const [refinedData, responseEncoding] = Array.isArray(account.data)
        ? encoding === 'jsonParsed'
            ? [account.data[0], 'base64']
            : [account.data[0], encoding]
        : [refineJsonParsedAccountData(account.data), 'jsonParsed'];

    const responseBase = {
        ...account,
        address,
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
}

// Default to jsonParsed encoding if none is provided
export async function loadAccount(rpc: Rpc, { address, ...config }: ReturnType<typeof normalizeArgs>) {
    const { encoding } = config;

    const account = await rpc
        .getAccountInfo(address, config as Parameters<SolanaRpcMethods['getAccountInfo']>[1])
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });

    // Account does not exist, return only the address
    if (account === null) {
        return { address };
    }

    return processQueryResponse({ account, address, encoding });
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
            // If a user only requests the account's address, don't call the RPC or the cache
            if (onlyPresentFieldRequested('address', info)) {
                return { address: args.address };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
