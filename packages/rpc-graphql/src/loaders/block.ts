import { SolanaRpcMethods } from '@solana/rpc-core';
import { GraphQLResolveInfo } from 'graphql';

import { GraphQLCache } from '../cache';
import type { Rpc } from '../context';
import { BlockQueryArgs } from '../schema/block';
import { refineJsonParsedTransaction } from './transaction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function refineJsonParsedTransactionForAccounts({ transaction }: { transaction: any }) {
    return {
        data: transaction.transaction,
        meta: transaction.meta,
        version: transaction.version,
    };
}

function processQueryResponse({
    encoding,
    block,
    transactionDetails,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: any;
    encoding: string;
    transactionDetails: string;
}) {
    if (typeof block === 'object' && 'transactions' in block) {
        const refinedBlock = {
            ...block,
            transactions: block.transactions.map((transaction: unknown) => {
                if (transactionDetails === 'accounts') {
                    return refineJsonParsedTransactionForAccounts({ transaction });
                } else {
                    return refineJsonParsedTransaction({ encoding, transaction });
                }
            }),
        };
        block = refinedBlock;
    }
    return {
        ...block,
        encoding,
        transactionDetails,
    };
}

export async function loadBlock(
    { slot, encoding = 'jsonParsed', ...config }: BlockQueryArgs,
    cache: GraphQLCache,
    rpc: Rpc,
    _info?: GraphQLResolveInfo
) {
    const requestConfig = {
        encoding,
        ...config,
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
    };
    const transactionDetails = config.transactionDetails ?? 'full';

    const cached = cache.get(slot, config);
    if (cached !== null) {
        return cached;
    }

    const block = await rpc
        .getBlock(slot, requestConfig as unknown as Parameters<SolanaRpcMethods['getBlock']>[1])
        .send()
        .catch(e => {
            throw e;
        });

    if (block === null) {
        return { slot };
    }

    const queryResponse = processQueryResponse({ block, encoding, transactionDetails });

    cache.insert(slot, requestConfig, queryResponse);

    return queryResponse;
}
