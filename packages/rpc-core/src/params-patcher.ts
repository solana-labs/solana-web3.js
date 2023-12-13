import { KeyPath, KEYPATH_WILDCARD } from './patcher-types';

type Config = Readonly<{
    nodeTransformersForKeyPaths?: readonly NodeTransformerForKeyPath[];
    onIntegerOverflow?: IntegerOverflowHandler;
}>;
type IntegerOverflowHandler = (keyPath: (number | string)[], value: bigint) => void;
type NodeTransformer = <T>(node: T) => unknown;
type NodeTransformerForKeyPath = readonly [KeyPath, NodeTransformer];
type Patched<T> = T extends object ? { [Property in keyof T]: Patched<T[Property]> } : T extends bigint ? number : T;
// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

function getNextNodeTransformersForKeyPaths(
    nodeTransformersForKeyPaths: readonly NodeTransformerForKeyPath[],
    property: number | string,
): NodeTransformerForKeyPath[] {
    return nodeTransformersForKeyPaths
        .filter(
            ([keyPath]) => (keyPath[0] === KEYPATH_WILDCARD && typeof property === 'number') || keyPath[0] === property,
        )
        .map(([keyPath, ...rest]) => [keyPath.slice(1), ...rest]);
}

function visitNode<T>(
    value: T,
    keyPath: (number | string)[],
    nodeTransformersForKeyPaths: readonly NodeTransformerForKeyPath[],
    onIntegerOverflow?: IntegerOverflowHandler,
): Patched<T> {
    const transformedValue = nodeTransformersForKeyPaths
        // Select transformers whose key path has been fully consumed on the way to this node.
        // This implies that the transformer is destined for this node and should be applied now.
        .filter(([keyPath]) => keyPath.length === 0)
        .reduce<unknown>((acc, [_, nodeTransformer]) => nodeTransformer(acc), value) as T;
    if (Array.isArray(transformedValue)) {
        return transformedValue.map((element, ii) => {
            const nextTransformersForKeyPaths = getNextNodeTransformersForKeyPaths(nodeTransformersForKeyPaths, ii);
            return visitNode(element, [...keyPath, ii], nextTransformersForKeyPaths, onIntegerOverflow);
        }) as TypescriptBug33014;
    } else if (typeof transformedValue === 'object' && transformedValue !== null) {
        const out = {} as TypescriptBug33014;
        for (const propName in transformedValue) {
            if (Object.prototype.hasOwnProperty.call(transformedValue, propName)) {
                const nextTransformersForKeyPaths = getNextNodeTransformersForKeyPaths(
                    nodeTransformersForKeyPaths,
                    propName,
                );
                out[propName] = visitNode(
                    transformedValue[propName],
                    [...keyPath, propName],
                    nextTransformersForKeyPaths,
                    onIntegerOverflow,
                );
            }
        }
        return out as TypescriptBug33014;
    } else if (typeof transformedValue === 'bigint') {
        // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // downcasting `bigints` to `numbers`.
        if (
            onIntegerOverflow &&
            (transformedValue > Number.MAX_SAFE_INTEGER || transformedValue < -Number.MAX_SAFE_INTEGER)
        ) {
            onIntegerOverflow(keyPath, transformedValue);
        }
        return Number(transformedValue) as TypescriptBug33014;
    } else {
        return transformedValue as Patched<T>;
    }
}

export function patchParamsForSolanaLabsRpc<T>(params: T, config?: Config): Patched<T> {
    return visitNode(params, [], config?.nodeTransformersForKeyPaths ?? [], config?.onIntegerOverflow);
}
