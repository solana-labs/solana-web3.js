import { KeyPath, KEYPATH_WILDCARD, TraversalState } from './tree-traversal';

function keyPathIsAllowedToBeNumeric(keyPath: KeyPath, allowedNumericKeyPaths: readonly KeyPath[]) {
    return allowedNumericKeyPaths.some(prohibitedKeyPath => {
        if (prohibitedKeyPath.length !== keyPath.length) {
            return false;
        }
        for (let ii = keyPath.length - 1; ii >= 0; ii--) {
            const keyPathPart = keyPath[ii];
            const prohibitedKeyPathPart = prohibitedKeyPath[ii];
            if (
                prohibitedKeyPathPart !== keyPathPart &&
                (prohibitedKeyPathPart !== KEYPATH_WILDCARD || typeof keyPathPart !== 'number')
            ) {
                return false;
            }
        }
        return true;
    });
}

export function getBigIntUpcastVisitor(allowedNumericKeyPaths: readonly KeyPath[]) {
    return function upcastNodeToBigIntIfNumber(value: unknown, { keyPath }: TraversalState) {
        if (
            typeof value === 'number' &&
            Number.isInteger(value) &&
            !keyPathIsAllowedToBeNumeric(keyPath, allowedNumericKeyPaths)
        ) {
            // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the
            // Solana JSON RPC implementation so that we can throw away this entire patcher instead
            // of unsafely upcasting `numbers` to `bigints`.
            return BigInt(value);
        } else {
            return value;
        }
    };
}
