import { getTreeWalkerResponseTransformer, KeyPath, KEYPATH_WILDCARD, TraversalState } from './tree-traversal';

export function getBigIntUpcastResponseTransformer(allowedNumericKeyPaths: readonly KeyPath[]) {
    return getTreeWalkerResponseTransformer([getBigIntUpcastVisitor(allowedNumericKeyPaths)], { keyPath: [] });
}

export function getBigIntUpcastVisitor(allowedNumericKeyPaths: readonly KeyPath[]) {
    return function upcastNodeToBigIntIfNumber(value: unknown, { keyPath }: TraversalState) {
        const isInteger = (typeof value === 'number' && Number.isInteger(value)) || typeof value === 'bigint';
        if (!isInteger) return value;
        if (keyPathIsAllowedToBeNumeric(keyPath, allowedNumericKeyPaths)) {
            return Number(value);
        } else {
            return BigInt(value);
        }
    };
}

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
