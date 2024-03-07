import { Address } from '@solana/addresses';
import { Commitment, Slot } from '@solana/rpc-types';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { cacheKeyFn } from '../loaders';
import { AccountResult } from './account';
import { buildProgramAccountsLoaderArgSetFromResolveInfo } from './resolve-info';

export function resolveProgramAccounts(fieldName?: string) {
    return async (
        parent: { [x: string]: Address },
        args: {
            commitment?: Commitment;
            filters?: readonly { memcmp: { bytes: string; offset: number } }[];
            minContextSlot?: Slot;
            programAddress: Address;
        },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ): Promise<AccountResult[] | null> => {
        const programAddress = fieldName ? parent[fieldName] : args.programAddress;

        if (programAddress) {
            const argsSet = buildProgramAccountsLoaderArgSetFromResolveInfo({ ...args, programAddress }, info);
            const loadedProgramAccountsLists = await context.loaders.programAccounts.loadMany(argsSet);

            const result: {
                [address: string]: AccountResult;
            } = {};

            loadedProgramAccountsLists.forEach((programAccounts, i) => {
                if (programAccounts instanceof Error) {
                    console.error(programAccounts);
                    return;
                }
                programAccounts.forEach(programAccount => {
                    const { account, pubkey: address } = programAccount;

                    const thisResult = (result[address] ||= {
                        ...account,
                        address,
                        encodedData: {},
                        ownerProgram: account.owner,
                    });

                    const { data } = account;
                    const { encoding, dataSlice } = argsSet[i];

                    if (encoding && thisResult.encodedData) {
                        if (Array.isArray(data)) {
                            thisResult.encodedData[
                                cacheKeyFn({
                                    dataSlice,
                                    encoding: encoding === 'jsonParsed' ? 'base64' : encoding,
                                })
                            ] = data[0];
                        } else if (typeof data === 'string') {
                            thisResult.encodedData[
                                cacheKeyFn({
                                    dataSlice,
                                    encoding: 'base58',
                                })
                            ] = data;
                        } else if (typeof data === 'object') {
                            const {
                                parsed: { info: parsedData, type: accountType },
                                program: programName,
                                programId,
                            } = data;
                            thisResult.jsonParsedConfigs = {
                                accountType,
                                programId,
                                programName,
                            };
                            for (const key in parsedData as object) {
                                thisResult[key as keyof typeof thisResult] = parsedData[key];
                            }
                        }
                    }
                });
            });
            return Object.values(result);
        }
        return null;
    };
}
