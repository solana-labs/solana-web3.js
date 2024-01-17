/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stringify from 'json-stable-stringify';

function replacer(_: any, value: any) {
    if (typeof value === 'bigint') {
        return value.toString() + 'n';
    }
    return value;
}

export const cacheKeyFn = (obj: any) => stringify(obj, { replacer });
