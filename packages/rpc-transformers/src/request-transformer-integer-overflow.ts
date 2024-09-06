import { RpcRequest } from '@solana/rpc-spec';

import { getTreeWalkerRequestTransformer, KeyPath, TraversalState } from './tree-traversal';

export type IntegerOverflowHandler = (request: RpcRequest, keyPath: KeyPath, value: bigint) => void;

export function getIntegerOverflowRequestTransformer(onIntegerOverflow: IntegerOverflowHandler) {
    return <TParams>(request: RpcRequest<TParams>): RpcRequest => {
        const transformer = getTreeWalkerRequestTransformer(
            [getIntegerOverflowNodeVisitor((...args) => onIntegerOverflow(request, ...args))],
            { keyPath: [] },
        );
        return transformer(request);
    };
}

export function getIntegerOverflowNodeVisitor(onIntegerOverflow: (keyPath: KeyPath, value: bigint) => void) {
    return <T>(value: T, { keyPath }: TraversalState): T => {
        if (typeof value === 'bigint') {
            if (onIntegerOverflow && (value > Number.MAX_SAFE_INTEGER || value < -Number.MAX_SAFE_INTEGER)) {
                onIntegerOverflow(keyPath as (number | string)[], value);
            }
        }
        return value;
    };
}
