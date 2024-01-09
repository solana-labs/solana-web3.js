/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

// This is a temporary fix for now. It is not optimized for performance,
// however, this library's parameter sets used for cache keys are relatively
// small, so it should not be a problem.
//
// `fast-stable-stringify` does not support `bigint` values, and some
// alternatives seem to opt for converting `bigint` to number. It's much more
// preferable, in the context of cache keys for relatively small parameter
// sets, to convert `bigint` to `string` instead.
//
// Although one might suggest setting the global `BigInt.prototype.toString`,
// however, `fast-stable-stringify` attempts to identify boolean, object,
// function, undefined, then string before defaulting to number, so there is no
// feasible way to inject `BigInt.prototype.toString` into the call stack.
//
// This function converts any `bigint` values in the object to `string` values,
// then passes the modified object to `fast-stable-stringify`.
export function cacheKeyFn(obj: any) {
    function bigintToString(obj: any) {
        if (typeof obj === 'bigint') {
            return obj.toString();
        }
        if (typeof obj === 'object') {
            const newObj = {};
            for (const key in obj) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                newObj[key] = bigintToString(obj[key]);
            }
            return newObj;
        }
        return obj;
    }
    return fastStableStringify(bigintToString(obj));
}
