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

function stringify(val, isArrayProp) {
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
            } else if (val.toJSON && typeof val.toJSON === 'function') {
                return stringify(val.toJSON(), isArrayProp);
            } else {
                toStr = objToString.call(val);
                if (toStr === '[object Array]') {
                    str = '[';
                    max = val.length - 1;
                    for (i = 0; i < max; i++) {
                        str += stringify(val[i], true) + ',';
                    }
                    if (max > -1) {
                        str += stringify(val[i], true);
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
                        propVal = stringify(val[key], false);
                        if (propVal !== undefined) {
                            if (str) {
                                str += ',';
                            }
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
            return JSON.stringify(val.toString() + 'n‽');
        case 'string':
            return JSON.stringify(val);
        default:
            return isFinite(val) ? val : null;
    }
}

export default function (val) {
    const returnVal = stringify(val, false);
    if (returnVal !== undefined) {
        return '' + returnVal;
    }
}
