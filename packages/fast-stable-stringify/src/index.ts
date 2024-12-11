const objToString = Object.prototype.toString;
const objKeys =
    Object.keys ||
    function (obj) {
        const keys = [];
        for (const name in obj) {
            keys.push(name);
        }
        return keys;
    };

function stringify(val: unknown, isArrayProp: boolean) {
    let i, max, str, keys, key, propVal, toStr;
    if (val === true) {
        return 'true';
    }
    if (val === false) {
        return 'false';
    }
    switch (typeof val) {
        case 'object':
            if (val === null) {
                return null;
            } else if ('toJSON' in val && typeof val.toJSON === 'function') {
                return stringify(val.toJSON(), isArrayProp);
            } else {
                toStr = objToString.call(val);
                if (toStr === '[object Array]') {
                    str = '[';
                    max = (val as unknown[]).length - 1;
                    for (i = 0; i < max; i++) {
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        str += stringify((val as unknown[])[i], true) + ',';
                    }
                    if (max > -1) {
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        str += stringify((val as unknown[])[i], true);
                    }
                    return str + ']';
                } else if (toStr === '[object Object]') {
                    // only object is left
                    keys = objKeys(val).sort();
                    max = keys.length;
                    str = '';
                    i = 0;
                    while (i < max) {
                        key = keys[i];
                        propVal = stringify((val as Record<typeof key, unknown>)[key], false);
                        if (propVal !== undefined) {
                            if (str) {
                                str += ',';
                            }
                            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                            str += JSON.stringify(key) + ':' + propVal;
                        }
                        i++;
                    }
                    return '{' + str + '}';
                } else {
                    return JSON.stringify(val);
                }
            }
        case 'function':
        case 'undefined':
            return isArrayProp ? null : undefined;
        case 'bigint':
            return `${val.toString()}n`;
        case 'string':
            return JSON.stringify(val);
        default:
            return isFinite(val as number) ? val : null;
    }
}

export default function (
    val:
        | Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type
        | undefined,
): undefined;
export default function (val: unknown): string;
export default function (val: unknown): string | undefined {
    const returnVal = stringify(val, false);
    if (returnVal !== undefined) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return '' + returnVal;
    }
}
