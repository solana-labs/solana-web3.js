import {
    getAllowedNumericKeypathsForNotification,
    getAllowedNumericKeypathsForResponse,
} from './response-patcher-allowed-numeric-values';
import { getBigIntUpcastVisitor } from './response-patcher-bigint-upcast';
import { createSolanaRpcApi } from './rpc-methods';
import { createSolanaRpcSubscriptionsApi } from './rpc-subscriptions';
import { getTreeWalker } from './tree-traversal';

export function patchResponseForSolanaLabsRpc<T>(
    rawResponse: unknown,
    methodName?: keyof ReturnType<typeof createSolanaRpcApi>,
): T {
    const allowedNumericKeyPaths = methodName ? getAllowedNumericKeypathsForResponse()[methodName] : undefined;
    const traverse = getTreeWalker([getBigIntUpcastVisitor(allowedNumericKeyPaths ?? [])]);
    const initialState = {
        keyPath: [],
    };
    return traverse(rawResponse, initialState) as T;
}

export function patchResponseForSolanaLabsRpcSubscriptions<T>(
    rawResponse: unknown,
    notificationName?: keyof ReturnType<typeof createSolanaRpcSubscriptionsApi>,
): T {
    const allowedNumericKeyPaths = notificationName
        ? getAllowedNumericKeypathsForNotification()[notificationName]
        : undefined;
    const traverse = getTreeWalker([getBigIntUpcastVisitor(allowedNumericKeyPaths ?? [])]);
    const initialState = {
        keyPath: [],
    };
    return traverse(rawResponse, initialState) as T;
}
