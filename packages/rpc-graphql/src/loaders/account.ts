import { Address } from '@solana/addresses';
import { SolanaRpcMethods } from '@solana/rpc-core';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import type { Rpc } from '../context';
import { AccountQueryArgs } from '../schema/account';

function normalizeArgs(args: Omit<AccountQueryArgs, 'address'>) {
    const { commitment, dataSlice, encoding, minContextSlot } = args;
    return {
        commitment: commitment ?? 'confirmed',
        dataSlice,
        encoding: encoding ?? 'jsonParsed',
        minContextSlot,
    };
}

function onlyAddressRequested(info?: GraphQLResolveInfo): boolean {
    if (info && info.fieldNodes[0].selectionSet) {
        const selectionSet = info.fieldNodes[0].selectionSet;
        const requestedFields = selectionSet.selections.map(field => {
            if (field.kind === 'Field') {
                return field.name.value;
            }
            return null;
        });
        if (requestedFields && requestedFields.length === 1 && requestedFields[0] === 'address') {
            return true;
        }
    }
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function refineJsonParsedAccountData(jsonParsedAccountData: any) {
    const meta = {
        program: jsonParsedAccountData.program,
        space: jsonParsedAccountData.space,
        type: jsonParsedAccountData.parsed.type,
    };
    const data = jsonParsedAccountData.parsed.info;
    return { data, meta };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export async function loadAccount(
    { address, ...config }: AccountQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc,
    info?: GraphQLResolveInfo
) {
    // If a user only requests the account's address, don't call the RPC
    if (onlyAddressRequested(info)) {
        return { address };
    }

    const requestConfig = normalizeArgs(config);
    const { encoding } = requestConfig;

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
        // Account does not exist, return only the address
        return { address };
    }

    const queryResponse = processQueryResponse({ account, address, encoding });

    cache.insert(address, requestConfig, queryResponse);

    return queryResponse;
}
