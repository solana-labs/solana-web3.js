/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { BlockQueryArgs } from '../schema/block';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { refineJsonParsedTransaction } from './transaction';

function normalizeArgs(args: BlockQueryArgs) {
    const { commitment, encoding, slot, transactionDetails } = args;
    return {
        commitment: commitment ?? 'confirmed',
        encoding: encoding ?? 'jsonParsed',
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0,
        slot,
        transactionDetails: transactionDetails ?? 'full',
    };
}

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

export async function loadBlock(rpc: Rpc, { slot, ...config }: ReturnType<typeof normalizeArgs>) {
    const { encoding, transactionDetails } = config;

    const block = await rpc
        .getBlock(slot, config as unknown as Parameters<SolanaRpcMethods['getBlock']>[1])
        .send()
        .catch(e => {
            throw e;
        });

    if (block === null) {
        return { slot };
    }

    const queryResponse = processQueryResponse({ block, encoding, transactionDetails });

    return queryResponse;
}

function createBlockBatchLoadFn(rpc: Rpc) {
    const resolveBlockUsingRpc = loadBlock.bind(null, rpc);
    return async (blockQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(blockQueryArgs.map(async args => await resolveBlockUsingRpc(args)));
    };
}

export function createBlockLoader(rpc: Rpc) {
    const loader = new DataLoader(createBlockBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: BlockQueryArgs, info?: GraphQLResolveInfo) => {
            // If a user only requests the block's slot, don't call the RPC or the cache
            if (onlyPresentFieldRequested('slot', info)) {
                return { slot: args.slot };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
