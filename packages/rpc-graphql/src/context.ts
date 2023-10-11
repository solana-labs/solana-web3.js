import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createGraphQLCache, GraphQLCache } from './cache';
import { AccountQueryArgs } from './schema/account/query';
import { BlockQueryArgs } from './schema/block';
import { ProgramAccountsQueryArgs } from './schema/program-accounts';
import { TransactionQueryArgs } from './schema/transaction/query';

export interface RpcGraphQLContext {
    cache: GraphQLCache;
    resolveAccount(args: AccountQueryArgs): ReturnType<typeof resolveAccount>;
    resolveBlock(args: BlockQueryArgs): ReturnType<typeof resolveBlock>;
    resolveProgramAccounts(args: ProgramAccountsQueryArgs): ReturnType<typeof resolveProgramAccounts>;
    resolveTransaction(args: TransactionQueryArgs): ReturnType<typeof resolveTransaction>;
    rpc: Rpc<SolanaRpcMethods>;
}

// Default to jsonParsed encoding if none is provided
async function resolveAccount(
    { address, encoding = 'jsonParsed', ...config }: AccountQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
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
        return null;
    }

    const [data, responseEncoding] = Array.isArray(account.data)
        ? encoding === 'jsonParsed'
            ? [account.data[0], 'base64']
            : [account.data[0], encoding]
        : [account.data, 'jsonParsed'];
    const queryResponse = {
        ...account,
        data,
        encoding: responseEncoding,
    };

    cache.insert(address, requestConfig, queryResponse);

    return queryResponse;
}

async function resolveBlock(
    { slot, encoding = 'jsonParsed', ...config }: BlockQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const requestConfig = { encoding, ...config };

    const cached = cache.get(slot, config);
    if (cached !== null) {
        return cached;
    }

    const block = await rpc.getBlock(slot, requestConfig as Parameters<SolanaRpcMethods['getBlock']>[1]).send();

    if (block === null) {
        return null;
    }

    cache.insert(slot, config, block);

    return block;
}

async function resolveProgramAccounts(
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
        const [data, responseEncoding] = Array.isArray(programAccount.account.data)
            ? encoding === 'jsonParsed'
                ? [programAccount.account.data[0], 'base64']
                : [programAccount.account.data[0], encoding]
            : [programAccount.account.data, 'jsonParsed'];
        const pubkey = programAccount.pubkey;
        const account = { ...programAccount.account, data, encoding: responseEncoding };
        return {
            account,
            pubkey,
        };
    });

    cache.insert(programAddress, requestConfig, queryResponse);

    return queryResponse;
}

async function resolveTransaction(
    { signature, encoding = 'jsonParsed', ...config }: TransactionQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc<SolanaRpcMethods>
) {
    const requestConfig = { encoding, ...config };

    const cached = cache.get(signature, requestConfig);
    if (cached !== null) {
        return cached;
    }

    const transaction = await rpc
        .getTransaction(signature, requestConfig as Parameters<SolanaRpcMethods['getTransaction']>[1])
        .send();

    if (transaction === null) {
        return null;
    }

    const [transactionData, responseEncoding, responseFormat] = Array.isArray(transaction.transaction)
        ? encoding === 'jsonParsed'
            ? [transaction.transaction[0], 'base64', 'unparsed']
            : [transaction.transaction[0], encoding, 'unparsed']
        : encoding === 'jsonParsed'
        ? [transaction.transaction, encoding, 'parsed']
        : [transaction.transaction, encoding, 'unparsed'];
    if (transaction.meta) {
        // Ugly, but tells TypeScript what's happening
        (transaction.meta as { format?: string } & { [key: string]: unknown })['format'] = responseFormat;
    }
    if (transactionData.message) {
        // Ugly, but tells TypeScript what's happening
        (transactionData.message as { format?: string } & { [key: string]: unknown })['format'] = responseFormat;
    }
    const queryResponse = {
        ...transaction,
        encoding: responseEncoding,
        transaction: transactionData,
    };

    cache.insert(signature, requestConfig, queryResponse);

    return queryResponse;
}

export function createSolanaGraphQLContext(rpc: Rpc<SolanaRpcMethods>): RpcGraphQLContext {
    const cache = createGraphQLCache();
    return {
        cache,
        resolveAccount(args) {
            return resolveAccount(args, this.cache, this.rpc);
        },
        resolveBlock(args) {
            return resolveBlock(args, this.cache, this.rpc);
        },
        resolveProgramAccounts(args) {
            return resolveProgramAccounts(args, this.cache, this.rpc);
        },
        resolveTransaction(args) {
            return resolveTransaction(args, this.cache, this.rpc);
        },
        rpc,
    };
}
