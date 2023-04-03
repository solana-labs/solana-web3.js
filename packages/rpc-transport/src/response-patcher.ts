type Patched<T> = T extends object ? { [Property in keyof T]: Patched<T[Property]> } : T extends number ? bigint : T;
// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

function visitNode<T>(value: T): Patched<T> {
    if (Array.isArray(value)) {
        return value.map(element => visitNode(element)) as TypescriptBug33014;
    } else if (typeof value === 'object' && value !== null) {
        const out = {} as TypescriptBug33014;
        for (const propName in value) {
            if (Object.prototype.hasOwnProperty.call(value, propName)) {
                out[propName] = visitNode(value[propName]);
            }
        }
        return out as TypescriptBug33014;
    } else if (typeof value === 'number') {
        // FIXME(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // upcasting `numbers` to `bigints`.
        return BigInt(value) as TypescriptBug33014;
    } else {
        return value as TypescriptBug33014;
    }
}

export function patchResponseForSolanaLabsRpc<T>(response: T): Patched<T> {
    return visitNode(response);
}
