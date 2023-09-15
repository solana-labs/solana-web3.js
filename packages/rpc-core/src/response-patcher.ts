import {
    getAllowedNumericKeypathsForNotification,
    getAllowedNumericKeypathsForResponse,
} from './response-patcher-allowed-numeric-values';
import { KEYPATH_WILDCARD, KeyPathWildcard } from './response-patcher-types';
import { createSolanaRpcApi } from './rpc-methods';
import { createSolanaRpcSubscriptionsApi } from './rpc-subscriptions';

export type KeyPath = ReadonlyArray<KeyPathWildcard | number | string | KeyPath>;
// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

function getNextAllowedKeypaths(keyPaths: readonly KeyPath[], property: number | string) {
    return keyPaths
        .filter(keyPath => (keyPath[0] === KEYPATH_WILDCARD && typeof property === 'number') || keyPath[0] === property)
        .map(keyPath => keyPath.slice(1));
}

function visitNode<T>(value: unknown, allowedKeypaths: readonly KeyPath[]): T {
    if (Array.isArray(value)) {
        return value.map((element, ii) => {
            const nextAllowedKeypaths = getNextAllowedKeypaths(allowedKeypaths, ii);
            return visitNode(element, nextAllowedKeypaths);
        }) as TypescriptBug33014;
    } else if (typeof value === 'object' && value !== null) {
        const out = {} as TypescriptBug33014;
        for (const [propName, innerValue] of Object.entries(value)) {
            const nextAllowedKeypaths = getNextAllowedKeypaths(allowedKeypaths, propName);
            out[propName] = visitNode(innerValue, nextAllowedKeypaths);
        }
        return out as TypescriptBug33014;
    } else if (
        typeof value === 'number' &&
        // The presence of an allowed keypath on the route to this value implies it's allowlisted;
        // Upcast the value to `bigint` unless an allowed keypath is present.
        allowedKeypaths.length === 0 &&
        // Only try to upcast an Integer to `bigint`
        Number.isInteger(value)
    ) {
        // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // upcasting `numbers` to `bigints`.
        return BigInt(value) as TypescriptBug33014;
    } else {
        return value as TypescriptBug33014;
    }
}

export function patchResponseForSolanaLabsRpc<T>(
    rawResponse: unknown,
    methodName?: keyof ReturnType<typeof createSolanaRpcApi>
): T {
    const allowedKeypaths = methodName ? getAllowedNumericKeypathsForResponse()[methodName] : undefined;
    return visitNode(rawResponse, allowedKeypaths ?? []);
}

export function patchResponseForSolanaLabsRpcSubscriptions<T>(
    rawResponse: unknown,
    methodName?: keyof ReturnType<typeof createSolanaRpcSubscriptionsApi>
): T {
    const allowedKeypaths = methodName ? getAllowedNumericKeypathsForNotification()[methodName] : undefined;
    return visitNode(rawResponse, allowedKeypaths ?? []);
}
