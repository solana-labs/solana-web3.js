type IntegerOverflowHandler = (keyPath: (number | string)[], value: bigint) => void;
type Patched<T> = T extends object ? { [Property in keyof T]: Patched<T[Property]> } : T extends bigint ? number : T;
// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

function visitNode<T>(value: T, keyPath: (number | string)[], onIntegerOverflow?: IntegerOverflowHandler): Patched<T> {
    if (Array.isArray(value)) {
        return value.map((element, ii) =>
            visitNode(element, [...keyPath, ii], onIntegerOverflow)
        ) as TypescriptBug33014;
    } else if (typeof value === 'object' && value !== null) {
        const out = {} as TypescriptBug33014;
        for (const propName in value) {
            if (Object.prototype.hasOwnProperty.call(value, propName)) {
                out[propName] = visitNode(value[propName], [...keyPath, propName], onIntegerOverflow);
            }
        }
        return out as TypescriptBug33014;
    } else if (typeof value === 'bigint') {
        // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // downcasting `bigints` to `numbers`.
        if (onIntegerOverflow && (value > Number.MAX_SAFE_INTEGER || value < -Number.MAX_SAFE_INTEGER)) {
            onIntegerOverflow(keyPath, value);
        }
        return Number(value) as TypescriptBug33014;
    } else {
        return value as TypescriptBug33014;
    }
}

export function patchParamsForSolanaLabsRpc<T>(params: T, onIntegerOverflow?: IntegerOverflowHandler): Patched<T> {
    return visitNode(params, [], onIntegerOverflow);
}
