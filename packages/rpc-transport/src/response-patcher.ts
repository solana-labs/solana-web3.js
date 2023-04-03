import { ALLOWED_NUMERIC_KEYPATHS } from './response-patcher-allowed-numeric-values';
import { KeyPathWildcard, KEYPATH_WILDCARD } from './response-patcher-types';

import { SolanaJsonRpcApi } from '@solana/rpc-core';

export type KeyPath = ReadonlyArray<KeyPathWildcard | number | string | KeyPath>;
type Patched<T> = T extends object ? { [Property in keyof T]: Patched<T[Property]> } : T extends number ? bigint : T;
// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

function getNextAllowedKeypaths(keyPaths: readonly KeyPath[], property: number | string) {
    return keyPaths
        .filter(keyPath => (keyPath[0] === KEYPATH_WILDCARD && typeof property === 'number') || keyPath[0] === property)
        .map(keyPath => keyPath.slice(1));
}

function visitNode<T>(value: T, allowedKeypaths: readonly KeyPath[]): Patched<T> {
    if (Array.isArray(value)) {
        return value.map((element, ii) => {
            const nextAllowedKeypaths = getNextAllowedKeypaths(allowedKeypaths, ii);
            return visitNode(element, nextAllowedKeypaths);
        }) as TypescriptBug33014;
    } else if (typeof value === 'object' && value !== null) {
        const out = {} as TypescriptBug33014;
        for (const propName in value) {
            if (Object.prototype.hasOwnProperty.call(value, propName)) {
                const nextAllowedKeypaths = getNextAllowedKeypaths(allowedKeypaths, propName);
                out[propName] = visitNode(value[propName], nextAllowedKeypaths);
            }
        }
        return out as TypescriptBug33014;
    } else if (
        typeof value === 'number' &&
        // The presence of an allowed keypath on the route to this value implies it's allowlisted;
        // Upcast the value to `bigint` unless an allowed keypath is present.
        allowedKeypaths.length === 0
    ) {
        // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // upcasting `numbers` to `bigints`.
        return BigInt(value) as TypescriptBug33014;
    } else {
        return value as TypescriptBug33014;
    }
}

export function patchResponseForSolanaLabsRpc<T>(response: T, methodName?: keyof SolanaJsonRpcApi): Patched<T> {
    return visitNode(response, (methodName && ALLOWED_NUMERIC_KEYPATHS[methodName]) ?? []);
}
