import type { GetProgramAccountsApi, Rpc } from '@solana/rpc';
import DataLoader from 'dataloader';

import { sliceData } from './account';
import { buildCoalescedFetchesByArgsHashWithDataSlice, ToFetchMap } from './coalescer';
import {
    cacheKeyFn,
    ProgramAccountsLoader,
    ProgramAccountsLoaderArgs,
    ProgramAccountsLoaderArgsBase,
    ProgramAccountsLoaderValue,
} from './loader';

type Config = {
    maxDataSliceByteRange: number;
};

async function loadProgramAccounts(
    rpc: Rpc<GetProgramAccountsApi>,
    { programAddress, ...config }: ProgramAccountsLoaderArgs,
): Promise<ProgramAccountsLoaderValue> {
    // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
    return await rpc
        .getProgramAccounts(
            programAddress,
            // @ts-expect-error FIX ME: https://github.com/microsoft/TypeScript/issues/43187
            config,
        )
        .send();
}

function createProgramAccountsBatchLoadFn(rpc: Rpc<GetProgramAccountsApi>, config: Config) {
    const resolveProgramAccountsUsingRpc = loadProgramAccounts.bind(null, rpc);
    return (accountQueryArgs: readonly ProgramAccountsLoaderArgs[]): ReturnType<ProgramAccountsLoader['loadMany']> => {
        /**
         * Gather all the program-accounts that need to be fetched, grouped by
         * program address.
         */
        const programAccountsToFetch: ToFetchMap<ProgramAccountsLoaderArgsBase, ProgramAccountsLoaderValue> = {};
        try {
            return Promise.all(
                accountQueryArgs.map(
                    ({ programAddress, ...args }) =>
                        new Promise((resolve, reject) => {
                            const accountRecords = (programAccountsToFetch[programAddress] ||= []);
                            // Apply the default commitment level.
                            if (!args.commitment) {
                                args.commitment = 'confirmed';
                            }
                            accountRecords.push({ args, promiseCallback: { reject, resolve } });
                        }),
                ),
            ) as ReturnType<ProgramAccountsLoader['loadMany']>;
        } finally {
            const { maxDataSliceByteRange } = config;

            /**
             * Group together program-accounts that are fetched with identical args.
             */
            const programAccountsFetchesByArgsHash = buildCoalescedFetchesByArgsHashWithDataSlice(
                programAccountsToFetch,
                maxDataSliceByteRange,
            );

            /**
             * For each set of program-accounts related to some common args, fetch them in the fewest
             * number of network requests.
             */
            Object.values(programAccountsFetchesByArgsHash).map(({ args, fetches: programAddressCallbacks }) => {
                return Object.entries(programAddressCallbacks).map(([programAddress, { callbacks }]) => {
                    return Array.from({ length: 1 }, async () => {
                        try {
                            const result = await resolveProgramAccountsUsingRpc({
                                programAddress,
                                ...args,
                            } as ProgramAccountsLoaderArgs);
                            callbacks.forEach(({ callback, dataSlice }) => {
                                callback.resolve(sliceData(result, dataSlice, args.dataSlice));
                            });
                        } catch (e) {
                            callbacks.forEach(({ callback }) => {
                                callback.reject(e);
                            });
                        }
                    });
                });
            });
        }
    };
}

export function createProgramAccountsLoader(rpc: Rpc<GetProgramAccountsApi>, config: Config): ProgramAccountsLoader {
    const loader = new DataLoader(createProgramAccountsBatchLoadFn(rpc, config), { cacheKeyFn });
    return {
        load: args => loader.load(args),
        loadMany: args => loader.loadMany(args),
    };
}
