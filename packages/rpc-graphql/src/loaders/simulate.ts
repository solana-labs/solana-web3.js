import { SolanaRpcMethods } from '@solana/rpc-core';
import DataLoader from 'dataloader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';
import { GraphQLResolveInfo } from 'graphql';

import type { Rpc } from '../context';
import { SimulateQueryArgs } from '../schema/simulate';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedSimulationResult } from './transformers/simulation-result';

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    accounts,
    commitment = 'confirmed',
    encoding = 'base64',
    minContextSlot,
    replaceRecentBlockhash,
    sigVerify,
    transaction,
}: SimulateQueryArgs) {
    return { accounts, commitment, encoding, minContextSlot, replaceRecentBlockhash, sigVerify, transaction };
}

/* Simulate a transaction with the RPC, transform the response, then return it */
async function simulate(rpc: Rpc, { transaction, ...config }: ReturnType<typeof normalizeArgs>) {
    const simulationResult = await rpc
        .simulateTransaction(transaction, config as unknown as Parameters<SolanaRpcMethods['simulateTransaction']>[1])
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });
    return transformLoadedSimulationResult({ simulationResult });
}

function createSimulateBatchLoadFn(rpc: Rpc) {
    const resolveSimulationUsingRpc = simulate.bind(null, rpc);
    return async (simulateQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        return await Promise.all(simulateQueryArgs.map(async args => await resolveSimulationUsingRpc(args)));
    };
}

export function createSimulateLoader(rpc: Rpc) {
    const loader = new DataLoader(createSimulateBatchLoadFn(rpc), { cacheKeyFn: fastStableStringify });
    return {
        load: async (args: SimulateQueryArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('transaction', info)) {
                // If a user only requests the transaction,
                // don't call the RPC or the cache
                return { transaction: args.transaction };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
