import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import { AccountQueryArgs } from '../schema/account';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function refineJsonParsedAccountData(jsonParsedData: any) {
    const meta = {
        program: jsonParsedData.program,
        space: jsonParsedData.space,
        type: jsonParsedData.parsed.type,
    };
    const data = jsonParsedData.parsed.info;
    return { data, meta };
}

// Default to jsonParsed encoding if none is provided
export async function resolveAccount(
    { address, encoding = 'jsonParsed', ...config }: AccountQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>,
    info?: GraphQLResolveInfo
) {
    // If a user only requests the account's address, don't call the RPC
    if (info && info.fieldNodes[0].selectionSet) {
        const selectionSet = info.fieldNodes[0].selectionSet;
        const requestedFields = selectionSet.selections.map(field => {
            if (field.kind === 'Field') {
                return field.name.value;
            }
            return null;
        });
        if (requestedFields && requestedFields.length === 1 && requestedFields[0] === 'address') {
            return { address };
        }
    }

    const requestConfig = { encoding, ...config };

    const cached = cache.get(address, requestConfig);
    if (cached !== null) {
        return cached;
    }

    const account = await rpc
        .getAccountInfo(address, requestConfig as Parameters<SolanaRpcMethods['getAccountInfo']>[1])
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });

    if (account === null) {
        // Account does not exist
        // Return only the address
        return {
            address,
        };
    }

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
    const queryResponse =
        typeof refinedData === 'object' && 'meta' in refinedData
            ? {
                  ...responseBase,
                  data: refinedData.data,
                  meta: refinedData.meta,
              }
            : {
                  ...responseBase,
                  data: refinedData,
              };

    cache.insert(address, requestConfig, queryResponse);

    return queryResponse;
}
