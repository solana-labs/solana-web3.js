import { Commitment } from '@solana/rpc-core';
import { TransactionSignature, TransactionVersion } from '@solana/transactions';

import { RpcGraphQLContext } from '../../context';
import { commitmentInputType, maxSupportedTransactionVersionInputType, transactionEncodingInputType } from '../inputs';
import { nonNull, string, type } from '../picks';
import { transactionInterface } from './types';

export type TransactionQueryArgs = {
    signature: TransactionSignature;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    maxSupportedTransactionVersion?: Exclude<TransactionVersion, 'legacy'>;
};

/**
 * Transaction root query for GraphQL
 */
export const transactionQuery = () => ({
    transaction: {
        args: {
            commitment: type(commitmentInputType()),
            encoding: type(transactionEncodingInputType()),
            maxSupportedTransactionVersion: type(maxSupportedTransactionVersionInputType()),
            signature: nonNull(string()),
        },
        resolve: (_parent: unknown, args: TransactionQueryArgs, context: RpcGraphQLContext) =>
            context.resolveTransaction(args),
        type: transactionInterface(),
    },
});
