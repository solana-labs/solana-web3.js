import { SolanaRpcMethods } from '@solana/rpc-core';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import type { Commitment, Connection } from '@solana/web3.js';

import { extractLegacyParameters } from './parameters';
import { processRequest } from './request';
import {
    responseSchemaGetBlockTime,
    responseSchemaGetFirstAvailableBlock,
    responseSchemaGetSupply,
    responseSchemaMinimumLedgerSlot,
} from './response';

/**
 * Builds a shim for the legacy `Connection` class, which is
 * ported around and re-exported by many Solana dApps and APIs.
 *
 * This shim, although almost equally as large in bundle size
 * as its legacy counterpart, leverages the functionality of
 * `@solana/web3.js@2.0.0`.
 *
 * It's designed to mimic the exact interface of the legacy
 * `Connection` class, in order to provide developers a safer
 * way to migrate their app from one library to the other.
 *
 * @param rpc   The new Web3.js RPC client object
 * @returns     A shim for the legacy `Connection` class
 */
export function createLegacyConnectionShim(
    rpc: Rpc<SolanaRpcMethods>,
    commitment: Commitment
): InstanceType<typeof Connection> {
    const defaultConfigs = { commitment };
    return {
        commitment,
        getBlockTime: (...params) =>
            processRequest({
                errorMessage: `failed to get block time for slot ${params[0]}`,
                responseSchema: responseSchemaGetBlockTime,
                send: () => rpc.getBlockTime(...extractLegacyParameters<'getBlockTime'>([params[0]])).send(),
            }),
        getFirstAvailableBlock: () =>
            processRequest({
                errorMessage: 'failed to get first available block',
                responseSchema: responseSchemaGetFirstAvailableBlock,
                send: () => rpc.getFirstAvailableBlock().send(),
            }),
        getMinimumLedgerSlot: () =>
            processRequest({
                errorMessage: 'failed to get minimum ledger slot',
                responseSchema: responseSchemaMinimumLedgerSlot,
                send: () => rpc.minimumLedgerSlot().send(),
            }),
        getSupply: (...params) =>
            processRequest({
                errorMessage: 'failed to get supply',
                responseSchema: responseSchemaGetSupply,
                send: () => rpc.getSupply(...extractLegacyParameters<'getSupply'>([], params, defaultConfigs)).send(),
            }),
        /* TODO: Remaining methods */
    };
}
