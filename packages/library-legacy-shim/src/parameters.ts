/* eslint-disable @typescript-eslint/no-explicit-any */
import { SolanaRpcMethods } from '@solana/rpc-core';
import type { Commitment, Finality } from '@solana/web3.js';

export function extractLegacyParameters<TMethodName extends keyof SolanaRpcMethods>(
    params: any[],
    commitmentOrConfig?: Commitment | Finality | { commitment?: Commitment; [propName: string]: any },
    defaultConfig?: { [propName: string]: any }
): Parameters<SolanaRpcMethods[TMethodName]> {
    let config =
        commitmentOrConfig && typeof commitmentOrConfig === 'string'
            ? { commitment: commitmentOrConfig }
            : commitmentOrConfig;
    if (defaultConfig) {
        if (config) {
            for (const [key, value] of Object.entries(defaultConfig)) {
                if (config[key] === undefined) {
                    config[key] = value;
                }
            }
        } else {
            config = defaultConfig;
        }
    }
    if (config) params.push(config);
    return params as Parameters<
        SolanaRpcMethods[TMethodName] extends CallableFunction ? SolanaRpcMethods[TMethodName] : never
    >;
}
