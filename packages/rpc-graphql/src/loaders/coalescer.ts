import { DataSlice } from '@solana/rpc-types';

import { BatchLoadPromiseCallback, cacheKeyFn } from './loader';

type Encoding = ('base58' | 'base64' | 'base64+zstd' | 'jsonParsed') | ('base58' | 'base64' | 'json' | 'jsonParsed');

export type Fetch<TArgs extends { encoding?: Encoding }, TValue> = Readonly<{
    args: TArgs;
    promiseCallback: BatchLoadPromiseCallback<TValue>;
}>;
export type ToFetchMap<TArgs extends { encoding?: Encoding }, TValue> = {
    [key: string]: Fetch<TArgs, TValue>[];
};
export type FetchesByArgsHash<TArgs extends { encoding?: Encoding }, TValue> = {
    [argsHash: string]: {
        args: TArgs;
        fetches: {
            [key: string]: {
                callbacks: BatchLoadPromiseCallback<TValue>[];
            };
        };
    };
};
export type FetchesByArgsHashWithDataSlice<TArgs extends { dataSlice?: DataSlice; encoding?: Encoding }, TValue> = {
    [argsHash: string]: {
        args: TArgs;
        fetches: {
            [key: string]: {
                callbacks: {
                    callback: BatchLoadPromiseCallback<TValue>;
                    dataSlice?: DataSlice | null;
                }[];
            };
        };
    };
};

const hashOmit = <TArgs extends object>(args: TArgs, omit: (keyof TArgs)[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const argsObj: any = {};
    for (const [key, value] of Object.entries(args)) {
        if (!omit.includes(key as keyof TArgs)) {
            argsObj[key] = value;
        }
    }
    return cacheKeyFn(argsObj);
};

export function buildCoalescedFetchesByArgsHash<TArgs extends { encoding?: Encoding }, TValue>(
    toFetchMap: ToFetchMap<TArgs, TValue>,
    orphanConfig: {
        criteria: (args: TArgs) => boolean;
        defaults: (args: TArgs) => TArgs;
        hashOmit: (keyof TArgs)[];
    },
): FetchesByArgsHash<TArgs, TValue> {
    const fetchesByArgsHash: FetchesByArgsHash<TArgs, TValue> = {};

    // Keep track of any fetches that don't specify an encoding, to be
    // wrapped into another fetch that does.
    const orphanedFetches: typeof toFetchMap = {};

    Object.entries(toFetchMap).forEach(([signature, toFetch]) => {
        toFetch.forEach(({ args, promiseCallback }) => {
            if (orphanConfig.criteria(args)) {
                const toFetch = (orphanedFetches[signature] ||= []);
                toFetch.push({ args, promiseCallback });
                return;
            }

            const argsHash = hashOmit(args, []);
            const transactionFetches = (fetchesByArgsHash[argsHash] ||= {
                args,
                fetches: {},
            });
            const { callbacks: promiseCallbacksForSignature } = (transactionFetches.fetches[signature] ||= {
                callbacks: [],
            });
            promiseCallbacksForSignature.push(promiseCallback);
        });
    });

    // Place the orphans
    Object.entries(orphanedFetches).forEach(([signature, toFetch]) => {
        toFetch.forEach(({ args: orphanArgs, promiseCallback: orphanPromiseCallback }) => {
            if (Object.keys(fetchesByArgsHash).length !== 0) {
                for (const { fetches, args } of Object.values(fetchesByArgsHash)) {
                    // Check if the two arg sets are a match without `encoding`
                    if (hashOmit(orphanArgs, orphanConfig.hashOmit) === hashOmit(args, orphanConfig.hashOmit)) {
                        const { callbacks: promiseCallbacksForSignature } = (fetches[signature] ||= {
                            callbacks: [],
                        });
                        promiseCallbacksForSignature.push(orphanPromiseCallback);
                        return;
                    }
                }
            }
            // Create a new fetch.
            const args = orphanConfig.defaults(orphanArgs);
            const argsHash = hashOmit(args, []);
            const transactionFetches = (fetchesByArgsHash[argsHash] ||= {
                args,
                fetches: {},
            });
            const { callbacks: promiseCallbacksForSignature } = (transactionFetches.fetches[signature] ||= {
                callbacks: [],
            });
            promiseCallbacksForSignature.push(orphanPromiseCallback);
        });
    });

    return fetchesByArgsHash;
}

export function buildCoalescedFetchesByArgsHashWithDataSlice<
    TArgs extends { dataSlice?: DataSlice; encoding?: Encoding },
    TValue,
>(toFetchMap: ToFetchMap<TArgs, TValue>, maxDataSliceByteRange: number): FetchesByArgsHashWithDataSlice<TArgs, TValue> {
    const fetchesByArgsHash: FetchesByArgsHashWithDataSlice<TArgs, TValue> = {};

    // Keep track of any fetches that don't specify an encoding, to be
    // wrapped into another fetch that does.
    const orphanedFetches: typeof toFetchMap = {};

    Object.entries(toFetchMap).forEach(([address, toFetch]) => {
        toFetch.forEach(({ args, promiseCallback }) => {
            // As per the schema, `encoding` can only be provided if a
            // `data` field is present, and the argument is required.
            // So we can assume if no encoding is provided, this
            // particular fetch is not concerned with data. We can
            // combine it with some other fetch.
            if (!args.encoding) {
                const toFetch = (orphanedFetches[address] ||= []);
                toFetch.push({ args, promiseCallback });
                return;
            }
            // As per the schema, `dataSlice` cannot be provided without
            // encoding.
            // Don't try to combine fetches with `base64+zstd` encoding.
            if (args.encoding != 'base64+zstd' && args.dataSlice) {
                // If the fetch arg set has `dataSlice` provided, try
                // to combine it with another request.
                const r = args.dataSlice;
                for (const { fetches: fetchAddresses, args: fetchArgs } of Object.values(fetchesByArgsHash)) {
                    /**
                     * Add a callback to the list of callbacks for the current address,
                     * possibly updating the `dataSlice` argument used for the entire
                     * fetch.
                     */
                    const addCallbackWithDataSlice = (updateDataSlice?: DataSlice) => {
                        const { callbacks: promiseCallbacksForAddress } = (fetchAddresses[address] ||= {
                            callbacks: [],
                        });
                        promiseCallbacksForAddress.push({
                            callback: promiseCallback,
                            dataSlice: args.dataSlice ?? null,
                        });
                        if (fetchArgs.dataSlice && updateDataSlice) {
                            fetchArgs.dataSlice = updateDataSlice;
                        }
                    };

                    // Check if the two arg sets are a match without the `dataSlice`
                    // argument.
                    if (hashOmit(args, ['dataSlice']) === hashOmit(fetchArgs, ['dataSlice'])) {
                        if (fetchArgs.dataSlice) {
                            // The arg sets match, and the fetch arg set has a `dataSlice`
                            // argument. Try to merge the two account fetches.
                            const g = fetchArgs.dataSlice;
                            if (r.offset <= g.offset && g.offset - r.offset + r.length <= maxDataSliceByteRange) {
                                const length = Math.max(r.length, g.offset + g.length - r.offset);
                                const offset = r.offset;
                                addCallbackWithDataSlice({ length, offset });
                                return;
                            }
                            if (r.offset >= g.offset && r.offset - g.offset + g.length <= maxDataSliceByteRange) {
                                const length = Math.max(g.length, r.offset + r.length - g.offset);
                                const offset = g.offset;
                                addCallbackWithDataSlice({ length, offset });
                                return;
                            }
                        } else {
                            // The arg sets match, and the fetch arg set has no `dataSlice`
                            // argument. Merge the two account fetches.
                            const { length, offset } = r;
                            addCallbackWithDataSlice({ length, offset });
                            return;
                        }
                    }
                }
            }
            // Either the fetch arg set has no `dataSlice` argument, or
            // it couldn't be combined with another fetch, likely due to
            // the wasted byte limitation.
            // Add the fetch to the list as a new fetch.
            const argsHash = hashOmit(args, []);
            const accountFetches = (fetchesByArgsHash[argsHash] ||= {
                args,
                fetches: {},
            });
            const { callbacks: promiseCallbacksForAddress } = (accountFetches.fetches[address] ||= {
                callbacks: [],
            });
            promiseCallbacksForAddress.push({ callback: promiseCallback, dataSlice: args.dataSlice ?? null });
        });
    });

    // Place the orphans
    Object.entries(orphanedFetches).forEach(([address, toFetch]) => {
        toFetch.forEach(({ args: orphanedArgs, promiseCallback: orphanPromiseCallback }) => {
            if (Object.keys(fetchesByArgsHash).length !== 0) {
                for (const { fetches, args } of Object.values(fetchesByArgsHash)) {
                    // Check if the two arg sets are a match without
                    // `encoding` and `dataSlice` arguments.
                    if (
                        hashOmit(orphanedArgs, ['encoding', 'dataSlice']) === hashOmit(args, ['encoding', 'dataSlice'])
                    ) {
                        const { callbacks: promiseCallbacksForAddress } = (fetches[address] ||= {
                            callbacks: [],
                        });
                        promiseCallbacksForAddress.push({ callback: orphanPromiseCallback });
                        return;
                    }
                }
            }
            // Create a new fetch. Prefer `base64` encoding.
            const args: TArgs = { ...orphanedArgs, encoding: 'base64' };
            const argsHash = hashOmit(args, []);
            const accountFetches = (fetchesByArgsHash[argsHash] ||= {
                args,
                fetches: {},
            });
            const { callbacks: promiseCallbacksForAddress } = (accountFetches.fetches[address] ||= {
                callbacks: [],
            });
            promiseCallbacksForAddress.push({ callback: orphanPromiseCallback });
        });
    });

    return fetchesByArgsHash;
}
