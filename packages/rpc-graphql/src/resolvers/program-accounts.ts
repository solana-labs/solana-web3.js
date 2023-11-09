import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { GraphQLCache } from '../cache';
import { ProgramAccountsQueryArgs } from '../schema/program-accounts';
import { refineJsonParsedAccountData } from './account';

export async function resolveProgramAccounts(
    { programAddress, encoding = 'jsonParsed', ...config }: ProgramAccountsQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const requestConfig = { encoding, ...config };

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

    const queryResponse = programAccounts.map(programAccount => {
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

    cache.insert(programAddress, requestConfig, queryResponse);

    return queryResponse;
}
