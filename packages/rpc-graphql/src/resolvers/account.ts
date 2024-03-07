import { Address } from '@solana/addresses';
import { Commitment, Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderValue, cacheKeyFn } from '../loaders';
import { buildAccountLoaderArgSetFromResolveInfo, onlyFieldsRequested } from './resolve-info';

type Encoding = 'base58' | 'base64' | 'base64+zstd';
type DataSlice = { length: number; offset: number };

export type EncodedAccountData = {
    [key: string]: string;
};

export type AccountResult = Partial<Omit<AccountLoaderValue, 'data'>> & {
    address: Address;
    encodedData?: EncodedAccountData;
    jsonParsedConfigs?: {
        accountType: string;
        programId: Address;
        programName: string;
    };
    ownerProgram?: Address;
};

const resolveAccountData = () => {
    return (
        parent: AccountResult | null,
        args: {
            dataSlice?: DataSlice;
            encoding: Encoding;
        },
    ) => {
        return parent === null ? null : parent.encodedData ? parent.encodedData[cacheKeyFn(args)] : null;
    };
};

export const resolveAccount = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Address },
        args: { address?: Address; commitment?: Commitment; minContextSlot?: Slot },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo,
    ): Promise<AccountResult | null> => {
        const address = fieldName ? parent[fieldName] : args.address;

        if (address) {
            // Do not load any accounts if only the address is requested
            if (onlyFieldsRequested(['address'], info)) {
                return { address };
            }

            const argsSet = buildAccountLoaderArgSetFromResolveInfo({ ...args, address }, info);
            const loadedAccounts = await context.loaders.account.loadMany(argsSet);

            let result: AccountResult = {
                address,
                encodedData: {},
            };

            loadedAccounts.forEach((account, i) => {
                if (account instanceof Error) {
                    console.error(account);
                    return;
                }
                if (account === null) {
                    return;
                }
                if (!result.ownerProgram) {
                    result = {
                        ...result,
                        ...account,
                        ownerProgram: account.owner,
                    };
                }

                const { data } = account;
                const { encoding, dataSlice } = argsSet[i];

                if (encoding && result.encodedData) {
                    if (Array.isArray(data)) {
                        result.encodedData[
                            cacheKeyFn({
                                dataSlice,
                                encoding: encoding === 'jsonParsed' ? 'base64' : encoding,
                            })
                        ] = data[0];
                    } else if (typeof data === 'string') {
                        result.encodedData[
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
            });

            return result;
        }

        return null;
    };
};

function resolveAccountType(accountResult: AccountResult) {
    const { jsonParsedConfigs } = accountResult;
    if (jsonParsedConfigs) {
        if (jsonParsedConfigs.programName === 'nonce') {
            return 'NonceAccount';
        }
        if (jsonParsedConfigs.accountType === 'mint' && jsonParsedConfigs.programName === 'spl-token') {
            return 'MintAccount';
        }
        if (jsonParsedConfigs.accountType === 'account' && jsonParsedConfigs.programName === 'spl-token') {
            return 'TokenAccount';
        }
        if (jsonParsedConfigs.programName === 'stake') {
            return 'StakeAccount';
        }
        if (jsonParsedConfigs.accountType === 'vote' && jsonParsedConfigs.programName === 'vote') {
            return 'VoteAccount';
        }
        if (
            jsonParsedConfigs.accountType === 'lookupTable' &&
            jsonParsedConfigs.programName === 'address-lookup-table'
        ) {
            return 'LookupTableAccount';
        }
    }
    return 'GenericAccount';
}

export const accountResolvers = {
    Account: {
        __resolveType: resolveAccountType,
        data: resolveAccountData(),
    },
    GenericAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    LookupTableAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    MintAccount: {
        data: resolveAccountData(),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccountDataMetaAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeAccountDataMetaLockup: {
        custodian: resolveAccount('custodian'),
    },
    StakeAccountDataStakeDelegation: {
        voter: resolveAccount('voter'),
    },
    TokenAccount: {
        data: resolveAccountData(),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccount: {
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        data: resolveAccountData(),
        node: resolveAccount('nodePubkey'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
};
