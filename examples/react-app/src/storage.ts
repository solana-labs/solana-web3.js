let storage: Storage | undefined;
try {
    if (typeof window !== 'undefined' && window.localStorage) {
        storage = window.localStorage;
    }
} catch {
    /* empty */
}

function guard<TArgs extends unknown[], TReturn, TFallbackReturn>(
    fn: (...args: TArgs) => TReturn,
    fallbackReturn: TFallbackReturn,
): (...args: TArgs) => TFallbackReturn | TReturn;
function guard<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn | undefined;
function guard<TArgs extends unknown[], TReturn, TFallbackReturn>(
    fn: (...args: TArgs) => TReturn,
    fallbackReturn?: TFallbackReturn,
): (...args: TArgs) => TFallbackReturn | TReturn | undefined {
    return (...args) => {
        try {
            return fn(...args);
        } catch (e) {
            console.error(e);
            return fallbackReturn;
        }
    };
}

export const localStorage: Pick<Storage, 'getItem' | 'removeItem' | 'setItem'> = {
    getItem: guard(k => {
        return storage?.getItem(k) ?? null;
    }, null),
    removeItem: guard(k => {
        storage?.removeItem(k);
    }),
    setItem: guard((k, v) => {
        storage?.setItem(k, v);
    }),
};
