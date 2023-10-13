import { Commitment } from '@solana/rpc-core';
import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { TransactionVersion } from '@solana/transactions';

import { RpcGraphQLContext } from '../../context';
import { blockTransactionDetailsInputType, commitmentInputType, transactionEncodingInputType } from '../inputs';
import { bigint, boolean, nonNull, string, type } from '../picks';
import { blockInterface } from './types';

export type BlockQueryArgs = {
    slot: Slot;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    maxSupportedTransactionVersion?: Exclude<TransactionVersion, 'legacy'>;
    rewards?: boolean;
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};

/**
 * Block root query for GraphQL
 */
export const blockQuery = () => ({
    block: {
        args: {
            commitment: type(commitmentInputType()),
            encoding: type(transactionEncodingInputType()),
            maxSupportedTransactionVersion: string(),
            rewards: boolean(),
            slot: nonNull(bigint()),
            transactionDetails: type(blockTransactionDetailsInputType()),
        },
        resolve: (_parent: unknown, args: BlockQueryArgs, context: RpcGraphQLContext) => context.resolveBlock(args),
        type: blockInterface(),
    },
});
