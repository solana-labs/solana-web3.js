import { AccountResult, resolveAccount, resolveAccountData } from '../../resolvers/account';

export const accountTypeResolvers = {
    Account: {
        __resolveType: (accountResult: AccountResult) => {
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
        },
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
