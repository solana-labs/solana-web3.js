import { Address } from '@solana/addresses';
import { DataSlice, GetAccountInfoApi, GetMultipleAccountsApi, Slot } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport';
import DataLoader from 'dataloader';
import { GraphQLResolveInfo } from 'graphql';

import { cacheKeyFn } from './common/cache-key-fn';
import { onlyPresentFieldRequested } from './common/resolve-info';
import { transformLoadedAccount } from './transformers/account';

export type AccountLoaderArgs = {
    address: Address;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    commitment?: 'processed' | 'confirmed' | 'finalized';
    minContextSlot?: Slot;
};

/* Normalizes RPC optional configs to use GraphQL API defaults */
function normalizeArgs({
    address,
    commitment = 'confirmed',
    dataSlice,
    encoding = 'jsonParsed',
    minContextSlot,
}: AccountLoaderArgs) {
    return { address, commitment, dataSlice, encoding, minContextSlot };
}

/* Load an account from the RPC, transform it, then return it */
async function loadAccount(rpc: Rpc<GetAccountInfoApi>, { address, ...config }: ReturnType<typeof normalizeArgs>) {
    const account = await rpc
        .getAccountInfo(address, config)
        .send()
        .then(res => res.value)
        .catch(e => {
            throw e;
        });
    return account === null ? { address } : transformLoadedAccount({ account, address, encoding: config.encoding });
}

function createAccountBatchLoadFn(rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>) {
    const resolveAccountUsingRpc = loadAccount.bind(null, rpc);
    return async (accountQueryArgs: readonly ReturnType<typeof normalizeArgs>[]) => {
        const accountsToFetch: {
            [address: string]: Readonly<{
                args: Omit<ReturnType<typeof normalizeArgs>, 'address'>;
                promiseCallbacks: Readonly<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }>;
            }>[];
        } = {};
        try {
            return accountQueryArgs.map(
                ({ address, ...args }) =>
                    new Promise((resolve, reject) => {
                        const accountRecords = (accountsToFetch[address] ||= []);
                        accountRecords.push({ args, promiseCallbacks: { reject, resolve } });
                    }),
            );
        } finally {
            /**
             * STEP 1
             * Group together accounts that are fetched with identical args.
             */
            const accountFetchesByArgsHash: {
                [argsHash: string]: {
                    args: Omit<ReturnType<typeof normalizeArgs>, 'address'>;
                    addresses: {
                        [address: string]: Readonly<{
                            resolve: (value: unknown) => void;
                            reject: (reason?: unknown) => void;
                        }>[];
                    };
                };
            } = {};
            Object.entries(accountsToFetch).forEach(([address, fetches]) => {
                fetches.forEach(({ args, promiseCallbacks }) => {
                    const argsHash = cacheKeyFn(args);
                    const accountFetches = (accountFetchesByArgsHash[argsHash] ||= { addresses: {}, args });
                    const promiseCallbacksForAddress = (accountFetches.addresses[address] ||= []);
                    promiseCallbacksForAddress.push(promiseCallbacks);
                });
            });

            /**
             * STEP 2 (TODO)
             * Collapse any fetches for the *same* account but *disjoint* data slices into one fetch
             * that encompases the union of all the data slices, but only if fetching the union of
             * the slices would not result in too much overfetching, for some definition of too
             * much. Done well, you can fetch the account once then parcel the right slice of data
             * out to the right consumers.
             */

            /**
             * STEP 3
             * For each set of accounts related to some common args, fetch them in the fewest number
             * of network requests.
             */
            Object.values(accountFetchesByArgsHash).forEach(async ({ args, addresses: addressCallbacks }) => {
                const addresses = Object.keys(addressCallbacks);
                if (addresses.length === 1) {
                    const address = addresses[0] as Address;
                    try {
                        const result = await resolveAccountUsingRpc({ address, ...args });
                        addressCallbacks[address].forEach(({ resolve }) => {
                            resolve(result);
                        });
                    } catch (e) {
                        addressCallbacks[address].forEach(({ reject }) => {
                            reject(e);
                        });
                    }
                } else {
                    try {
                        // TODO: Don't let these batches grow unbounded. Split them into multiple
                        // `getMultipleAccounts` calls when they grow beyond X addresses.
                        const { value: results } = await rpc.getMultipleAccounts(addresses as Address[], args).send();
                        addresses.forEach((address, ii) => {
                            const result = results[ii];
                            addressCallbacks[address].forEach(({ resolve }) => {
                                resolve(
                                    result === null
                                        ? { address }
                                        : transformLoadedAccount({
                                              account: result,
                                              address: address as Address,
                                              encoding: args.encoding,
                                          }),
                                );
                            });
                        });
                    } catch (e) {
                        addresses.forEach(address => {
                            addressCallbacks[address].forEach(({ reject }) => {
                                reject(e);
                            });
                        });
                    }
                }
            });
        }
    };
}

export function createAccountLoader(rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>) {
    const loader = new DataLoader(createAccountBatchLoadFn(rpc), { cacheKeyFn });
    return {
        load: async (args: AccountLoaderArgs, info?: GraphQLResolveInfo) => {
            if (onlyPresentFieldRequested('address', info)) {
                // If a user only requests the account's address,
                // don't call the RPC or the cache
                return { address: args.address };
            }
            return loader.load(normalizeArgs(args));
        },
    };
}
