import { Address } from '@solana/addresses';
import { getBase58Codec, getBase64Codec } from '@solana/codecs-strings';
import type { GetAccountInfoApi, GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import {
    AccountLoader,
    AccountLoaderArgs,
    AccountLoaderArgsBase,
    AccountLoaderValue,
    BatchLoadPromiseCallback,
    cacheKeyFn,
    MultipleAccountsLoaderArgs,
} from './loader';

type Config = {
    maxDataSliceByteRange: number;
    maxMultipleAccountsBatchSize: number;
};

type Encoding = 'base58' | 'base64' | 'base64+zstd';
type DataSlice = { length: number; offset: number };

type AccountBatchLoadPromiseCallback = BatchLoadPromiseCallback<AccountLoaderValue>;
type AccountBatchLoadCallbackItem = {
    callback: AccountBatchLoadPromiseCallback;
    dataSlice?: DataSlice | null;
};

function getCodec(encoding: Omit<Encoding, 'base64+zstd'>) {
    switch (encoding) {
        case 'base58':
            return getBase58Codec();
        default:
            return getBase64Codec();
    }
}

function sliceData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: any,
    dataSlice?: DataSlice | null,
    masterDataSlice?: DataSlice,
) {
    if (dataSlice) {
        const masterOffset = masterDataSlice ? masterDataSlice.offset : 0;

        const slicedData = (data: string, encoding: Encoding): string => {
            if (encoding === 'base64+zstd') {
                // Don't slice `base64+zstd` encoding.
                return data;
            }
            const { offset, length } = dataSlice;
            const trueOffset = offset - masterOffset;
            const codec = getCodec(encoding);
            return codec.decode(codec.encode(data).slice(trueOffset, trueOffset + length));
        };

        if (Array.isArray(account.data)) {
            const [data, encoding] = account.data;
            return {
                ...account,
                data: [slicedData(data, encoding), encoding],
            };
        } else if (typeof account.data === 'string') {
            const data = account.data;
            return {
                ...account,
                data: slicedData(data, 'base58'),
            };
        }
    }
    return account;
}

/**
 * Load an account using the RPC's `getAccountInfo` method.
 */
async function loadAccount(rpc: Rpc<GetAccountInfoApi>, { address, ...config }: AccountLoaderArgs) {
    return await rpc
        .getAccountInfo(address, config)
        .send()
        .then(res => res.value);
}

/**
 * Load multiple accounts using the RPC's `getMultipleAccounts` method.
 */
async function loadMultipleAccounts(
    rpc: Rpc<GetMultipleAccountsApi>,
    { addresses, ...config }: MultipleAccountsLoaderArgs,
) {
    return await rpc
        .getMultipleAccounts(addresses, config)
        .send()
        .then(res => res.value);
}

const hashOmit = (args: AccountLoaderArgsBase, omit: (keyof AccountLoaderArgsBase)[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const argsObj: any = {};
    for (const [key, value] of Object.entries(args)) {
        if (!omit.includes(key as keyof AccountLoaderArgsBase)) {
            argsObj[key] = value;
        }
    }
    return cacheKeyFn(argsObj);
};

function createAccountBatchLoadFn(rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>, config: Config) {
    const resolveAccountUsingRpc = loadAccount.bind(null, rpc);
    const resolveMultipleAccountsUsingRpc = loadMultipleAccounts.bind(null, rpc);
    return async (accountQueryArgs: readonly AccountLoaderArgs[]): ReturnType<AccountLoader['loadMany']> => {
        /**
         * Gather all the accounts that need to be fetched, grouped by address.
         */
        const accountsToFetch: {
            [address: string]: Readonly<{
                args: AccountLoaderArgsBase;
                promiseCallback: AccountBatchLoadPromiseCallback;
            }>[];
        } = {};
        try {
            return Promise.all(
                accountQueryArgs.map(
                    ({ address, ...args }) =>
                        new Promise((resolve, reject) => {
                            const accountRecords = (accountsToFetch[address] ||= []);
                            // Apply the default commitment level.
                            if (!args.commitment) {
                                args.commitment = 'confirmed';
                            }
                            accountRecords.push({ args, promiseCallback: { reject, resolve } });
                        }),
                ),
            ) as ReturnType<AccountLoader['loadMany']>;
        } finally {
            const { maxDataSliceByteRange, maxMultipleAccountsBatchSize } = config;

            /**
             * Group together accounts that are fetched with identical args.
             */
            const accountFetchesByArgsHash: {
                [argsHash: string]: {
                    args: AccountLoaderArgsBase;
                    addresses: {
                        [address: string]: {
                            callbacks: AccountBatchLoadCallbackItem[];
                        };
                    };
                };
            } = {};

            // Keep track of any fetches that don't specify an encoding, to be
            // wrapped into another fetch that does.
            const orphanedFetches: typeof accountsToFetch = {};

            Object.entries(accountsToFetch).forEach(([address, toFetch]) => {
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
                        for (const { addresses: fetchAddresses, args: fetchArgs } of Object.values(
                            accountFetchesByArgsHash,
                        )) {
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
                                    if (
                                        r.offset <= g.offset &&
                                        g.offset - r.offset + r.length <= maxDataSliceByteRange
                                    ) {
                                        const length = Math.max(r.length, g.offset + g.length - r.offset);
                                        const offset = r.offset;
                                        addCallbackWithDataSlice({ length, offset });
                                        return;
                                    }
                                    if (
                                        r.offset >= g.offset &&
                                        r.offset - g.offset + g.length <= maxDataSliceByteRange
                                    ) {
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
                    const accountFetches = (accountFetchesByArgsHash[argsHash] ||= {
                        addresses: {},
                        args,
                    });
                    const { callbacks: promiseCallbacksForAddress } = (accountFetches.addresses[address] ||= {
                        callbacks: [],
                    });
                    promiseCallbacksForAddress.push({ callback: promiseCallback, dataSlice: args.dataSlice ?? null });
                });
            });

            // Place the orphans
            Object.entries(orphanedFetches).forEach(([address, toFetch]) => {
                toFetch.forEach(({ args: orphanedArgs, promiseCallback: orphanPromiseCallback }) => {
                    if (Object.keys(accountFetchesByArgsHash).length !== 0) {
                        for (const { addresses, args } of Object.values(accountFetchesByArgsHash)) {
                            // Check if the two arg sets are a match without
                            // `encoding` and `dataSlice` arguments.
                            if (
                                hashOmit(orphanedArgs, ['encoding', 'dataSlice']) ===
                                hashOmit(args, ['encoding', 'dataSlice'])
                            ) {
                                const { callbacks: promiseCallbacksForAddress } = (addresses[address] ||= {
                                    callbacks: [],
                                });
                                promiseCallbacksForAddress.push({ callback: orphanPromiseCallback });
                                return;
                            }
                        }
                    }
                    // Create a new fetch. Prefer `base64` encoding.
                    const args: AccountLoaderArgsBase = { ...orphanedArgs, encoding: 'base64' };
                    const argsHash = hashOmit(args, []);
                    const accountFetches = (accountFetchesByArgsHash[argsHash] ||= {
                        addresses: {},
                        args,
                    });
                    const { callbacks: promiseCallbacksForAddress } = (accountFetches.addresses[address] ||= {
                        callbacks: [],
                    });
                    promiseCallbacksForAddress.push({ callback: orphanPromiseCallback });
                });
            });

            /**
             * For each set of accounts related to some common args, fetch them in the fewest number
             * of network requests.
             */
            Object.values(accountFetchesByArgsHash).map(({ args, addresses: addressCallbacks }) => {
                const addresses = Object.keys(addressCallbacks) as Address[];
                if (addresses.length === 1) {
                    const address = addresses[0];
                    return Array.from({ length: 1 }, async () => {
                        try {
                            const result = await resolveAccountUsingRpc({ address, ...args });
                            addressCallbacks[address].callbacks.forEach(({ callback, dataSlice }) => {
                                callback.resolve(sliceData(result, dataSlice, args.dataSlice));
                            });
                        } catch (e) {
                            addressCallbacks[address].callbacks.forEach(({ callback }) => {
                                callback.reject(e);
                            });
                        }
                    });
                } else {
                    return Array.from(
                        { length: Math.ceil(addresses.length / maxMultipleAccountsBatchSize) },
                        async (_, ii) => {
                            const startIndex = ii * maxMultipleAccountsBatchSize;
                            const endIndex = startIndex + maxMultipleAccountsBatchSize;
                            const chunk = addresses.slice(startIndex, endIndex);
                            try {
                                const results = await resolveMultipleAccountsUsingRpc({
                                    addresses: chunk,
                                    ...args,
                                });
                                chunk.forEach((address, ii) => {
                                    const result = results[ii];
                                    addressCallbacks[address].callbacks.forEach(({ callback, dataSlice }) => {
                                        callback.resolve(sliceData(result, dataSlice, args.dataSlice));
                                    });
                                });
                            } catch (e) {
                                chunk.forEach(address => {
                                    addressCallbacks[address].callbacks.forEach(({ callback }) => {
                                        callback.reject(e);
                                    });
                                });
                            }
                        },
                    );
                }
            });
        }
    };
}

export function createAccountLoader(
    rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>,
    config: Config,
): AccountLoader {
    const loader = new DataLoader(createAccountBatchLoadFn(rpc, config), { cacheKeyFn });
    return {
        load: async args => loader.load(args),
        loadMany: async args => loader.loadMany(args),
    };
}
