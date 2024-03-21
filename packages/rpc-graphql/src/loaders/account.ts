import { Address } from '@solana/addresses';
import { getBase58Codec, getBase64Codec } from '@solana/codecs-strings';
import type { GetAccountInfoApi, GetMultipleAccountsApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import { buildCoalescedFetchesByArgsHashWithDataSlice, ToFetchMap } from './coalescer';
import {
    AccountLoader,
    AccountLoaderArgs,
    AccountLoaderArgsBase,
    AccountLoaderValue,
    cacheKeyFn,
    MultipleAccountsLoaderArgs,
} from './loader';

type Config = {
    maxDataSliceByteRange: number;
    maxMultipleAccountsBatchSize: number;
};

type Encoding = 'base58' | 'base64' | 'base64+zstd';
type DataSlice = { length: number; offset: number };

function getCodec(encoding: Encoding) {
    switch (encoding) {
        case 'base58':
            return getBase58Codec();
        default:
            return getBase64Codec();
    }
}

export function sliceData(
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

function createAccountBatchLoadFn(rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>, config: Config) {
    const resolveAccountUsingRpc = loadAccount.bind(null, rpc);
    const resolveMultipleAccountsUsingRpc = loadMultipleAccounts.bind(null, rpc);
    return (accountQueryArgs: readonly AccountLoaderArgs[]): ReturnType<AccountLoader['loadMany']> => {
        /**
         * Gather all the accounts that need to be fetched, grouped by address.
         */
        const accountsToFetch: ToFetchMap<AccountLoaderArgsBase, AccountLoaderValue> = {};
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
            const accountFetchesByArgsHash = buildCoalescedFetchesByArgsHashWithDataSlice(
                accountsToFetch,
                maxDataSliceByteRange,
            );

            /**
             * For each set of accounts related to some common args, fetch them in the fewest number
             * of network requests.
             */
            Object.values(accountFetchesByArgsHash).map(({ args, fetches: addressCallbacks }) => {
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
        load: args => loader.load(args),
        loadMany: args => loader.loadMany(args),
    };
}
