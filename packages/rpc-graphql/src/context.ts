import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { createGraphQLCache, GraphQLCache } from './cache';
import { resolveAccount } from './resolvers/account';
import { resolveProgramAccounts } from './resolvers/program-accounts';
import { AccountQueryArgs } from './schema/account/query';
import { BlockQueryArgs } from './schema/block';
import { ProgramAccountsQueryArgs } from './schema/program-accounts';
import { TransactionQueryArgs } from './schema/transaction/query';

export interface RpcGraphQLContext {
    cache: GraphQLCache;
    resolveAccount(args: AccountQueryArgs, info?: GraphQLResolveInfo): ReturnType<typeof resolveAccount>;
    resolveBlock(args: BlockQueryArgs): ReturnType<typeof resolveBlock>;
    resolveProgramAccounts(args: ProgramAccountsQueryArgs): ReturnType<typeof resolveProgramAccounts>;
    resolveTransaction(args: TransactionQueryArgs): ReturnType<typeof resolveTransaction>;
    rpc: Rpc<SolanaRpcMethods>;
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
        resolveAccount(args, info?) {
            return resolveAccount(args, this.cache, this.rpc, info);
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
