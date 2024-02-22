import { Address } from '@solana/addresses';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { cacheKeyFn,ProgramAccountsLoaderArgs } from '../loaders';
import { AccountResult } from './account';
import { onlyFieldsRequested } from './resolve-info';

export function resolveProgramAccounts(fieldName?: string) {
    return async (
        parent: { [x: string]: Address },
        args: ProgramAccountsLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ) => {
        const programAddress = fieldName ? parent[fieldName] : args.programAddress;

        if (programAddress) {
            if (onlyFieldsRequested(['programAddress'], info)) {
                return { programAddress };
            }
        }

        // TODO: This needs to be split out from accounts. This only works for one data field at a time.
        const programAccounts = await context.loaders.programAccounts.load({ ...args, programAddress });
        if (programAccounts) {
            return programAccounts.map(programAccount => {
                const { account, pubkey: address } = programAccount;

                let result: AccountResult = {
                    ...account,
                    address,
                    encodedData: {},
                    ownerProgram: account.owner,
                };

                const { data } = account;
                const { encoding, dataSlice } = args;

                // TODO: Add encoding to this conditional once the program accounts
                // batch loader is implemented.
                if (result.encodedData) {
                    if (Array.isArray(data)) {
                        result.encodedData[cacheKeyFn({
                            dataSlice,
                            encoding: encoding === 'jsonParsed' ? 'base64' : encoding ?? 'base64',
                        })] = data[0];
                    } else if (typeof data === 'string') {
                        result.encodedData[cacheKeyFn({
                            dataSlice,
                            encoding: 'base58',
                        })] = data;
                    } else if (typeof data === 'object') {
                        const {
                            parsed: { info: parsedData, type: accountType },
                            program: programName,
                            programId,
                        } = data;
                        result.jsonParsedConfigs = {
                            accountType,
                            programId,
                            programName,
                        };
                        result = {
                            ...result,
                            ...(parsedData as object),
                        };
                    }
                }

                return result;
            });
        }

        return null;
    };
}
