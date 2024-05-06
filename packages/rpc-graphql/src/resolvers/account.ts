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
                        if (Array.isArray(parsedData)) {
                            // If the `jsonParsed` data is an array, put it
                            // into a field called `entries`.
                            Object.assign(result, { entries: parsedData });
                        } else {
                            result = {
                                ...result,
                                ...(parsedData as object),
                            };
                        }
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
        if (jsonParsedConfigs.programName === 'spl-token' || jsonParsedConfigs.programName === 'spl-token-2022') {
            if (jsonParsedConfigs.accountType === 'mint') {
                return 'MintAccount';
            }
            if (jsonParsedConfigs.accountType === 'account') {
                return 'TokenAccount';
            }
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
        if (jsonParsedConfigs.programName === 'sysvar') {
            if (jsonParsedConfigs.accountType === 'clock') {
                return 'SysvarClockAccount';
            }
            if (jsonParsedConfigs.accountType === 'epochRewards') {
                return 'SysvarEpochRewardsAccount';
            }
            if (jsonParsedConfigs.accountType === 'epochSchedule') {
                return 'SysvarEpochScheduleAccount';
            }
            if (jsonParsedConfigs.accountType === 'fees') {
                return 'SysvarFeesAccount';
            }
            if (jsonParsedConfigs.accountType === 'lastRestartSlot') {
                return 'SysvarLastRestartSlotAccount';
            }
            if (jsonParsedConfigs.accountType === 'recentBlockhashes') {
                return 'SysvarRecentBlockhashesAccount';
            }
            if (jsonParsedConfigs.accountType === 'rent') {
                return 'SysvarRentAccount';
            }
            if (jsonParsedConfigs.accountType === 'slotHashes') {
                return 'SysvarSlotHashesAccount';
            }
            if (jsonParsedConfigs.accountType === 'slotHistory') {
                return 'SysvarSlotHistoryAccount';
            }
            if (jsonParsedConfigs.accountType === 'stakeHistory') {
                return 'SysvarStakeHistoryAccount';
            }
        }
    }
    return 'GenericAccount';
}

type Token2022ExtensionResult = {
    extension: string;
    state: object;
};

const resolveToken2022Extensions = () => {
    return (parent: (AccountResult & { extensions?: Token2022ExtensionResult[] }) | null) => {
        if (parent != null && parent.extensions != undefined) {
            return parent.extensions.map(e => {
                const { extension, state } = e;
                return {
                    extension,
                    ...state,
                };
            });
        }
        return null;
    };
};

function resolveToken2022ExtensionType(extensionResult: Token2022ExtensionResult) {
    if (extensionResult.extension === 'interestBearingConfig') {
        return 'SplToken2022ExtensionInterestBearingConfig';
    }
    if (extensionResult.extension === 'mintCloseAuthority') {
        return 'SplToken2022ExtensionMintCloseAuthority';
    }
    if (extensionResult.extension === 'nonTransferable') {
        return 'SplToken2022ExtensionNonTransferable';
    }
    if (extensionResult.extension === 'permanentDelegate') {
        return 'SplToken2022ExtensionPermanentDelegate';
    }
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
        extensions: resolveToken2022Extensions(),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SplToken2022Extension: {
        __resolveType: resolveToken2022ExtensionType,
    },
    SplToken2022ExtensionInterestBearingConfig: {
        rateAuthority: resolveAccount('rateAuthority'),
    },
    SplToken2022ExtensionMintCloseAuthority: {
        closeAuthority: resolveAccount('closeAuthority'),
    },
    SplToken2022ExtensionPermanentDelegate: {
        delegate: resolveAccount('delegate'),
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
    SysvarClockAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarEpochRewardsAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarEpochScheduleAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarFeesAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarLastRestartSlotAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarRecentBlockhashesAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarRentAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarSlotHashesAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarSlotHistoryAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SysvarStakeHistoryAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    TokenAccount: {
        data: resolveAccountData(),
        extensions: resolveToken2022Extensions(),
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
