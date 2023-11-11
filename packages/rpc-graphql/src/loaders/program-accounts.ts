import { SolanaRpcMethods } from '@solana/rpc-core';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import type { Rpc } from '../context';
import { ProgramAccountsQueryArgs } from '../schema/program-accounts';
import { refineJsonParsedAccountData } from './account';

function normalizeArgs(args: Omit<ProgramAccountsQueryArgs, 'programAddress'>) {
    const { commitment, dataSlice, encoding, filters, minContextSlot } = args;
    return {
        commitment: commitment ?? 'confirmed',
        dataSlice,
        encoding: encoding ?? 'jsonParsed',
        filters,
        minContextSlot,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function loadProgramAccounts(
    { programAddress, ...config }: ProgramAccountsQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc,
    _info?: GraphQLResolveInfo
) {
    const requestConfig = normalizeArgs(config);
    const { encoding } = requestConfig;

    const cached = cache.get(programAddress, requestConfig);
    if (cached !== null) {
        return cached;
    }

    const programAccounts = await rpc
        .getProgramAccounts(programAddress, requestConfig as Parameters<SolanaRpcMethods['getProgramAccounts']>[1])
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

    cache.insert(programAddress, requestConfig, queryResponse);

    return queryResponse;
}
