import { RpcRequest, RpcRequestTransformer, RpcResponseTransformer } from '@solana/rpc-spec';

export type KeyPathWildcard = { readonly __brand: unique symbol };
export type KeyPath = ReadonlyArray<KeyPath | KeyPathWildcard | number | string>;

export const KEYPATH_WILDCARD = {} as KeyPathWildcard;

type NodeVisitor = <TState extends TraversalState>(value: unknown, state: TState) => unknown;
export type TraversalState = Readonly<{
    keyPath: KeyPath;
}>;

export function getTreeWalker(visitors: NodeVisitor[]) {
    return function traverse<TState extends TraversalState>(node: unknown, state: TState): unknown {
        if (Array.isArray(node)) {
            return node.map((element, ii) => {
                const nextState = {
                    ...state,
                    keyPath: [...state.keyPath, ii],
                };
                return traverse(element, nextState);
            });
        } else if (typeof node === 'object' && node !== null) {
            const out: Record<number | string | symbol, unknown> = {};
            for (const propName in node) {
                if (!Object.prototype.hasOwnProperty.call(node, propName)) {
                    continue;
                }
                const nextState = {
                    ...state,
                    keyPath: [...state.keyPath, propName],
                };
                out[propName] = traverse(node[propName as keyof typeof node], nextState);
            }
            return out;
        } else {
            return visitors.reduce((acc, visitNode) => visitNode(acc, state), node);
        }
    };
}

export function getTreeWalkerRequestTransformer<TState extends TraversalState>(
    visitors: NodeVisitor[],
    initialState: TState,
): RpcRequestTransformer {
    return <TParams>(request: RpcRequest<TParams>): RpcRequest => {
        const traverse = getTreeWalker(visitors);
        return Object.freeze({
            ...request,
            params: traverse(request.params, initialState),
        });
    };
}

export function getTreeWalkerResponseTransformer<TState extends TraversalState>(
    visitors: NodeVisitor[],
    initialState: TState,
): RpcResponseTransformer {
    return json => getTreeWalker(visitors)(json, initialState);
}
