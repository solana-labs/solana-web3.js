type Patched<T> = T extends object ? { [Property in keyof T]: Patched<T[Property]> } : T extends bigint ? number : T;

// FIXME(https://github.com/microsoft/TypeScript/issues/33014)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypescriptBug33014 = any;

export function patchParamsForSolanaLabsRpc<T>(params: T): Patched<T> {
    if (Array.isArray(params)) {
        return params.map(patchParamsForSolanaLabsRpc) as TypescriptBug33014;
    } else if (typeof params === 'object' && params !== null) {
        const out = {} as TypescriptBug33014;
        for (const propName in params) {
            if (Object.prototype.hasOwnProperty.call(params, propName)) {
                out[propName] = patchParamsForSolanaLabsRpc(params[propName]);
            }
        }
        return out as TypescriptBug33014;
    } else if (typeof params === 'bigint') {
        // TODO(solana-labs/solana/issues/30341) Create a data type to represent u64 in the Solana
        // JSON RPC implementation so that we can throw away this entire patcher instead of unsafely
        // downcasting `bigints` to `numbers`.
        return Number(params) as TypescriptBug33014;
    } else {
        return params as TypescriptBug33014;
    }
}
