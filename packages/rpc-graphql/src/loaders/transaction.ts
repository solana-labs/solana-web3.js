import { Signature } from '@solana/keys';
import { Commitment } from '@solana/rpc-types';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';

import { TransactionVersion } from '../../../transactions/dist/types';
import type { Rpc } from '../context';
import { cacheKeyFn } from './common/cache-key-fn';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedTransaction } from './transformers/transaction';

export type TransactionLoaderArgs = {
    signature: Signature;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'jsonParsed';
};

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({ commitment = 'confirmed', encoding = 'jsonParsed', signature }: TransactionLoaderArgs) {
    return {
        commitment,
        encoding,
        // Always use 0 to avoid silly errors
        maxSupportedTransactionVersion: 0 as TransactionVersion,
        signature,
    };
}

/* Load a transaction from the RPC, transform it, then return it */
async function loadTransaction(rpc: Rpc, { signature, ...config }: ReturnType<typeof normalizeArgs>) {
    const { encoding } = config;

    const transaction = await rpc
        .getTransaction(
            signature,
            // @ts-expect-error FIXME: https://github.com/solana-labs/solana-web3.js/issues/1984
            config,
        )
        .send()
        .catch(e => {
            throw e;
        });
    if (transaction === null) {
        return null;
    }

    // If the requested encoding is `base58` or `base64`,
    // first fetch the transaction with the requested encoding,
    // then fetch it again with `jsonParsed` encoding.
    // This ensures the response always has the full transaction meta.
    if (encoding !== 'jsonParsed') {
        const jsonParsedConfig = { ...config, encoding: 'jsonParsed' };
        const transactionJsonParsed = await rpc
            .getTransaction(
                signature,
                // @ts-expect-error FIXME: https://github.com/solana-labs/solana-web3.js/issues/1984
                jsonParsedConfig,
            )
            .send()
            .catch(e => {
                throw e;
            });
        if (transactionJsonParsed === null) {
            return null;
        }
        transaction.meta = transactionJsonParsed.meta;
    }

    return transformLoadedTransaction({ encoding, transaction });
}

function createTransactionBatchLoadFn(rpc: Rpc) {
    const resolveTransactionUsingRpc = loadTransaction.bind(null, rpc);
    return async (transactionQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(transactionQueryArgs.map(async args => await resolveTransactionUsingRpc(args)));
    };
}

export function createTransactionLoader(rpc: Rpc) {
    const loader = new DataLoader(createTransactionBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async (args: TransactionLoaderArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('signature', info)) {
                // If a user only requests the transaction's signature,
                // don't call the RPC or the cache
                return { signature: args.signature };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
