import { AccountResult, resolveAccount, resolveAccountData } from '../../resolvers/account';

type Token2022ExtensionResult = {
    extension: string;
    state: object;
};

const resolveTokenExtensions = () => {
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

const resolveAdditionalTokenMetadata = () => {
    return (parent: { additionalMetadata?: [string, string][] }) => {
        if (parent.additionalMetadata != undefined) {
            return parent.additionalMetadata.map(([key, value]) => {
                return {
                    key,
                    value,
                };
            });
        }
        return null;
    };
};

function resolveTokenExtensionType(extensionResult: Token2022ExtensionResult) {
    if (extensionResult.extension === 'confidentialTransferFeeConfig') {
        return 'SplTokenExtensionConfidentialTransferFeeConfig';
    }
    if (extensionResult.extension === 'confidentialTransferMint') {
        return 'SplTokenExtensionConfidentialTransferMint';
    }
    if (extensionResult.extension === 'defaultAccountState') {
        return 'SplTokenExtensionDefaultAccountState';
    }
    if (extensionResult.extension === 'groupPointer') {
        return 'SplTokenExtensionGroupPointer';
    }
    if (extensionResult.extension === 'groupMemberPointer') {
        return 'SplTokenExtensionGroupMemberPointer';
    }
    if (extensionResult.extension === 'interestBearingConfig') {
        return 'SplTokenExtensionInterestBearingConfig';
    }
    if (extensionResult.extension === 'metadataPointer') {
        return 'SplTokenExtensionMetadataPointer';
    }
    if (extensionResult.extension === 'mintCloseAuthority') {
        return 'SplTokenExtensionMintCloseAuthority';
    }
    if (extensionResult.extension === 'nonTransferable') {
        return 'SplTokenExtensionNonTransferable';
    }
    if (extensionResult.extension === 'permanentDelegate') {
        return 'SplTokenExtensionPermanentDelegate';
    }
    if (extensionResult.extension === 'tokenGroup') {
        return 'SplTokenExtensionTokenGroup';
    }
    if (extensionResult.extension === 'tokenGroupMember') {
        return 'SplTokenExtensionTokenGroupMember';
    }
    if (extensionResult.extension === 'tokenMetadata') {
        return 'SplTokenExtensionTokenMetadata';
    }
    if (extensionResult.extension === 'transferFeeConfig') {
        return 'SplTokenExtensionTransferFeeConfig';
    }
    if (extensionResult.extension === 'transferHook') {
        return 'SplTokenExtensionTransferHook';
    }
    if (extensionResult.extension === 'confidentialTransferAccount') {
        return 'SplTokenExtensionConfidentialTransferAccount';
    }
    if (extensionResult.extension === 'transferFeeAmount') {
        return 'SplTokenExtensionTransferFeeAmount';
    }
    if (extensionResult.extension === 'transferHookAccount') {
        return 'SplTokenExtensionTransferHookAccount';
    }
    if (extensionResult.extension === 'confidentialTransferFeeAmount') {
        return 'SplTokenExtensionConfidentialTransferFeeAmount';
    }
    if (extensionResult.extension === 'nonTransferableAccount') {
        return 'SplTokenExtensionNonTransferableAccount';
    }
    if (extensionResult.extension === 'immutableOwner') {
        return 'SplTokenExtensionImmutableOwner';
    }
    if (extensionResult.extension === 'memoTransfer') {
        return 'SplTokenExtensionMemoTransfer';
    }
    if (extensionResult.extension === 'cpiGuard') {
        return 'SplTokenExtensionCpiGuard';
    }
}

export const accountTypeResolvers = {
    Account: {
        __resolveType: (accountResult: AccountResult) => {
            const { jsonParsedConfigs } = accountResult;
            if (jsonParsedConfigs) {
                if (jsonParsedConfigs.programName === 'nonce') {
                    return 'NonceAccount';
                }
                if (
                    jsonParsedConfigs.programName === 'spl-token' ||
                    jsonParsedConfigs.programName === 'spl-token-2022'
                ) {
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
        },
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
        extensions: resolveTokenExtensions(),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    SplTokenExtension: {
        __resolveType: resolveTokenExtensionType,
    },
    SplTokenExtensionConfidentialTransferFeeConfig: {
        authority: resolveAccount('authority'),
    },
    SplTokenExtensionConfidentialTransferMint: {
        authority: resolveAccount('authority'),
    },
    SplTokenExtensionGroupMemberPointer: {
        authority: resolveAccount('authority'),
        memberAddress: resolveAccount('memberAddress'),
    },
    SplTokenExtensionGroupPointer: {
        authority: resolveAccount('authority'),
        groupAddress: resolveAccount('groupAddress'),
    },
    SplTokenExtensionInterestBearingConfig: {
        rateAuthority: resolveAccount('rateAuthority'),
    },
    SplTokenExtensionMetadataPointer: {
        authority: resolveAccount('authority'),
        metadataAddress: resolveAccount('metadataAddress'),
    },
    SplTokenExtensionMintCloseAuthority: {
        closeAuthority: resolveAccount('closeAuthority'),
    },
    SplTokenExtensionPermanentDelegate: {
        delegate: resolveAccount('delegate'),
    },
    SplTokenExtensionTokenGroup: {
        mint: resolveAccount('mint'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenExtensionTokenGroupMember: {
        group: resolveAccount('group'),
        mint: resolveAccount('mint'),
    },
    SplTokenExtensionTokenMetadata: {
        additionalMetadata: resolveAdditionalTokenMetadata(),
        mint: resolveAccount('mint'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenExtensionTransferFeeConfig: {
        transferFeeConfigAuthority: resolveAccount('transferFeeConfigAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    SplTokenExtensionTransferHook: {
        authority: resolveAccount('authority'),
        hookProgramId: resolveAccount('programId'),
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
        extensions: resolveTokenExtensions(),
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
