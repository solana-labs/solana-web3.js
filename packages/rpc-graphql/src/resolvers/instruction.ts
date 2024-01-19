import { resolveAccount } from './account';

export const instructionResolvers = {
    AdvanceNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    AllocateInstruction: {
        account: resolveAccount('account'),
    },
    AllocateWithSeedInstruction: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    AssignInstruction: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    AssignWithSeedInstruction: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    AuthorizeNonceAccountInstruction: {
        newAuthorized: resolveAccount('newAuthorized'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    BpfLoaderFinalizeInstruction: {
        account: resolveAccount('account'),
    },
    BpfLoaderWriteInstruction: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderCloseInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        programAccount: resolveAccount('programAccount'),
        recipient: resolveAccount('recipient'),
    },
    BpfUpgradeableLoaderDeployWithMaxDataLenInstruction: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderExtendProgramInstruction: {
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    BpfUpgradeableLoaderInitializeBufferInstruction: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderSetAuthorityCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderSetAuthorityInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderUpgradeInstruction: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderWriteInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
    },
    CloseLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        recipient: resolveAccount('recipient'),
    },
    CreateAccountInstruction: {
        newAccount: resolveAccount('newAccount'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    CreateAccountWithSeedInstruction: {
        base: resolveAccount('base'),
        owner: resolveAccount('owner'),
        seed: resolveAccount('seed'),
    },
    CreateLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        payerAccount: resolveAccount('payerAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    DeactivateLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
    },
    ExtendLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        payerAccount: resolveAccount('payerAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    FreezeLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
    },
    InitializeNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    Lockup: {
        custodian: resolveAccount('custodian'),
    },
    SplAssociatedTokenCreateIdempotentInstruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        source: resolveAccount('source'),
        systemProgram: resolveAccount('systemProgram'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplAssociatedTokenCreateInstruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        source: resolveAccount('source'),
        systemProgram: resolveAccount('systemProgram'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplAssociatedTokenRecoverNestedInstruction: {
        destination: resolveAccount('destination'),
        nestedMint: resolveAccount('nestedMint'),
        nestedOwner: resolveAccount('nestedOwner'),
        nestedSource: resolveAccount('nestedSource'),
        ownerMint: resolveAccount('ownerMint'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplTokenAmountToUiAmountInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenApproveCheckedInstruction: {
        delegate: resolveAccount('delegate'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenApproveInstruction: {
        delegate: resolveAccount('delegate'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenBurnCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenBurnInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenCloseAccountInstruction: {
        account: resolveAccount('account'),
        destination: resolveAccount('destination'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenFreezeAccountInstruction: {
        account: resolveAccount('account'),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        multisigFreezeAuthority: resolveAccount('multisigFreezeAuthority'),
    },
    SplTokenGetAccountDataSizeInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeAccount2Instruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeAccount3Instruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeAccountInstruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeMint2Instruction: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeMintCloseAuthorityInstruction: {
        mint: resolveAccount('mint'),
        newAuthority: resolveAccount('newAuthority'),
    },
    SplTokenInitializeMintInstruction: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeMultisig2Instruction: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenInitializeMultisigInstruction: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenMintToCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
    },
    SplTokenMintToInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
    },
    SplTokenRevokeInstruction: {
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenSetAuthorityInstruction: {
        authority: resolveAccount('authority'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    SplTokenSyncNativeInstruction: {
        account: resolveAccount('account'),
    },
    SplTokenThawAccountInstruction: {
        account: resolveAccount('account'),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        multisigFreezeAuthority: resolveAccount('multisigFreezeAuthority'),
    },
    SplTokenTransferCheckedInstruction: {
        authority: resolveAccount('authority'),
        destination: resolveAccount('destination'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        source: resolveAccount('source'),
    },
    SplTokenTransferInstruction: {
        authority: resolveAccount('authority'),
        destination: resolveAccount('destination'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        source: resolveAccount('source'),
    },
    SplTokenUiAmountToAmountInstruction: {
        mint: resolveAccount('mint'),
    },
    StakeAuthorizeCheckedInstruction: {
        authority: resolveAccount('authority'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeCheckedWithSeedInstruction: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeInstruction: {
        authority: resolveAccount('authority'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeWithSeedInstruction: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeDeactivateDelinquentInstruction: {
        referenceVoteAccount: resolveAccount('referenceVoteAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeDeactivateInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeDelegateStakeInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeInitializeCheckedInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeInitializeInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeInitializeInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeMergeInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeRedelegateInstruction: {
        newStakeAccount: resolveAccount('newStakeAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeSetLockupCheckedInstruction: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeSetLockupInstruction: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeSplitInstruction: {
        newSplitAccount: resolveAccount('newSplitAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeWithdrawInstruction: {
        destination: resolveAccount('destination'),
        stakeAccount: resolveAccount('stakeAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    TransactionInstruction: {
        __resolveType(instruction: { programName: string; instructionType: string }) {
            if (instruction.programName) {
                if (instruction.programName === 'address-lookup-table') {
                    if (instruction.instructionType === 'createLookupTable') {
                        return 'CreateLookupTableInstruction';
                    }
                    if (instruction.instructionType === 'freezeLookupTable') {
                        return 'FreezeLookupTableInstruction';
                    }
                    if (instruction.instructionType === 'extendLookupTable') {
                        return 'ExtendLookupTableInstruction';
                    }
                    if (instruction.instructionType === 'deactivateLookupTable') {
                        return 'DeactivateLookupTableInstruction';
                    }
                    if (instruction.instructionType === 'closeLookupTable') {
                        return 'CloseLookupTableInstruction';
                    }
                }
                if (instruction.programName === 'bpf-loader') {
                    if (instruction.instructionType === 'write') {
                        return 'BpfLoaderWriteInstruction';
                    }
                    if (instruction.instructionType === 'finalize') {
                        return 'BpfLoaderFinalizeInstruction';
                    }
                }
                if (instruction.programName === 'bpf-upgradeable-loader') {
                    if (instruction.instructionType === 'initializeBuffer') {
                        return 'BpfUpgradeableLoaderInitializeBufferInstruction';
                    }
                    if (instruction.instructionType === 'write') {
                        return 'BpfUpgradeableLoaderWriteInstruction';
                    }
                    if (instruction.instructionType === 'deployWithMaxDataLen') {
                        return 'BpfUpgradeableLoaderDeployWithMaxDataLenInstruction';
                    }
                    if (instruction.instructionType === 'upgrade') {
                        return 'BpfUpgradeableLoaderUpgradeInstruction';
                    }
                    if (instruction.instructionType === 'setAuthority') {
                        return 'BpfUpgradeableLoaderSetAuthorityInstruction';
                    }
                    if (instruction.instructionType === 'setAuthorityChecked') {
                        return 'BpfUpgradeableLoaderSetAuthorityCheckedInstruction';
                    }
                    if (instruction.instructionType === 'close') {
                        return 'BpfUpgradeableLoaderCloseInstruction';
                    }
                    if (instruction.instructionType === 'extendProgram') {
                        return 'BpfUpgradeableLoaderExtendProgramInstruction';
                    }
                }
                if (instruction.programName === 'spl-associated-token-account') {
                    if (instruction.instructionType === 'create') {
                        return 'SplAssociatedTokenCreateInstruction';
                    }
                    if (instruction.instructionType === 'createIdempotent') {
                        return 'SplAssociatedTokenCreateIdempotentInstruction';
                    }
                    if (instruction.instructionType === 'recoverNested') {
                        return 'SplAssociatedTokenRecoverNestedInstruction';
                    }
                }
                if (instruction.programName === 'spl-memo') {
                    return 'SplMemoInstruction';
                }
                if (instruction.programName === 'spl-token') {
                    if (instruction.instructionType === 'initializeMint') {
                        return 'SplTokenInitializeMintInstruction';
                    }
                    if (instruction.instructionType === 'initializeMint2') {
                        return 'SplTokenInitializeMint2Instruction';
                    }
                    if (instruction.instructionType === 'initializeAccount') {
                        return 'SplTokenInitializeAccountInstruction';
                    }
                    if (instruction.instructionType === 'initializeAccount2') {
                        return 'SplTokenInitializeAccount2Instruction';
                    }
                    if (instruction.instructionType === 'initializeAccount3') {
                        return 'SplTokenInitializeAccount3Instruction';
                    }
                    if (instruction.instructionType === 'initializeMultisig') {
                        return 'SplTokenInitializeMultisigInstruction';
                    }
                    if (instruction.instructionType === 'initializeMultisig2') {
                        return 'SplTokenInitializeMultisig2Instruction';
                    }
                    if (instruction.instructionType === 'transfer') {
                        return 'SplTokenTransferInstruction';
                    }
                    if (instruction.instructionType === 'approve') {
                        return 'SplTokenApproveInstruction';
                    }
                    if (instruction.instructionType === 'revoke') {
                        return 'SplTokenRevokeInstruction';
                    }
                    if (instruction.instructionType === 'setAuthority') {
                        return 'SplTokenSetAuthorityInstruction';
                    }
                    if (instruction.instructionType === 'mintTo') {
                        return 'SplTokenMintToInstruction';
                    }
                    if (instruction.instructionType === 'burn') {
                        return 'SplTokenBurnInstruction';
                    }
                    if (instruction.instructionType === 'closeAccount') {
                        return 'SplTokenCloseAccountInstruction';
                    }
                    if (instruction.instructionType === 'freezeAccount') {
                        return 'SplTokenFreezeAccountInstruction';
                    }
                    if (instruction.instructionType === 'thawAccount') {
                        return 'SplTokenThawAccountInstruction';
                    }
                    if (instruction.instructionType === 'transferChecked') {
                        return 'SplTokenTransferCheckedInstruction';
                    }
                    if (instruction.instructionType === 'approveChecked') {
                        return 'SplTokenApproveCheckedInstruction';
                    }
                    if (instruction.instructionType === 'mintToChecked') {
                        return 'SplTokenMintToCheckedInstruction';
                    }
                    if (instruction.instructionType === 'burnChecked') {
                        return 'SplTokenBurnCheckedInstruction';
                    }
                    if (instruction.instructionType === 'syncNative') {
                        return 'SplTokenSyncNativeInstruction';
                    }
                    if (instruction.instructionType === 'getAccountDataSize') {
                        return 'SplTokenGetAccountDataSizeInstruction';
                    }
                    if (instruction.instructionType === 'initializeImmutableOwner') {
                        return 'SplTokenInitializeImmutableOwnerInstruction';
                    }
                    if (instruction.instructionType === 'amountToUiAmount') {
                        return 'SplTokenAmountToUiAmountInstruction';
                    }
                    if (instruction.instructionType === 'uiAmountToAmount') {
                        return 'SplTokenUiAmountToAmountInstruction';
                    }
                    if (instruction.instructionType === 'initializeMintCloseAuthority') {
                        return 'SplTokenInitializeMintCloseAuthorityInstruction';
                    }
                }
                if (instruction.programName === 'stake') {
                    if (instruction.instructionType === 'initialize') {
                        return 'StakeInitializeInstruction';
                    }
                    if (instruction.instructionType === 'authorize') {
                        return 'StakeAuthorizeInstruction';
                    }
                    if (instruction.instructionType === 'delegate') {
                        return 'StakeDelegateStakeInstruction';
                    }
                    if (instruction.instructionType === 'split') {
                        return 'StakeSplitInstruction';
                    }
                    if (instruction.instructionType === 'withdraw') {
                        return 'StakeWithdrawInstruction';
                    }
                    if (instruction.instructionType === 'deactivate') {
                        return 'StakeDeactivateInstruction';
                    }
                    if (instruction.instructionType === 'setLockup') {
                        return 'StakeSetLockupInstruction';
                    }
                    if (instruction.instructionType === 'merge') {
                        return 'StakeMergeInstruction';
                    }
                    if (instruction.instructionType === 'authorizeWithSeed') {
                        return 'StakeAuthorizeWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'initializeChecked') {
                        return 'StakeInitializeCheckedInstruction';
                    }
                    if (instruction.instructionType === 'authorizeChecked') {
                        return 'StakeAuthorizeCheckedInstruction';
                    }
                    if (instruction.instructionType === 'authorizeCheckedWithSeed') {
                        return 'StakeAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'setLockupChecked') {
                        return 'StakeSetLockupCheckedInstruction';
                    }
                    if (instruction.instructionType === 'deactivateDelinquent') {
                        return 'StakeDeactivateDelinquentInstruction';
                    }
                    if (instruction.instructionType === 'redelegate') {
                        return 'StakeRedelegateInstruction';
                    }
                }
                if (instruction.programName === 'system') {
                    if (instruction.instructionType === 'createAccount') {
                        return 'CreateAccountInstruction';
                    }
                    if (instruction.instructionType === 'assign') {
                        return 'AssignInstruction';
                    }
                    if (instruction.instructionType === 'transfer') {
                        return 'TransferInstruction';
                    }
                    if (instruction.instructionType === 'createAccountWithSeed') {
                        return 'CreateAccountWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'advanceNonceAccount') {
                        return 'AdvanceNonceAccountInstruction';
                    }
                    if (instruction.instructionType === 'withdrawNonceAccount') {
                        return 'WithdrawNonceAccountInstruction';
                    }
                    if (instruction.instructionType === 'initializeNonceAccount') {
                        return 'InitializeNonceAccountInstruction';
                    }
                    if (instruction.instructionType === 'authorizeNonceAccount') {
                        return 'AuthorizeNonceAccountInstruction';
                    }
                    if (instruction.instructionType === 'upgradeNonceAccount') {
                        return 'UpgradeNonceAccountInstruction';
                    }
                    if (instruction.instructionType === 'allocate') {
                        return 'AllocateInstruction';
                    }
                    if (instruction.instructionType === 'allocateWithSeed') {
                        return 'AllocateWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'assignWithSeed') {
                        return 'AssignWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'transferWithSeed') {
                        return 'TransferWithSeedInstruction';
                    }
                }
                if (instruction.programName === 'vote') {
                    if (instruction.instructionType === 'initialize') {
                        return 'VoteInitializeAccountInstruction';
                    }
                    if (instruction.instructionType === 'authorize') {
                        return 'VoteAuthorizeInstruction';
                    }
                    if (instruction.instructionType === 'authorizeWithSeed') {
                        return 'VoteAuthorizeWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'authorizeCheckedWithSeed') {
                        return 'VoteAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.instructionType === 'vote') {
                        return 'VoteVoteInstruction';
                    }
                    if (instruction.instructionType === 'updatevotestate') {
                        return 'VoteUpdateVoteStateInstruction';
                    }
                    if (instruction.instructionType === 'updatevotestateswitch') {
                        return 'VoteUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.instructionType === 'compactupdatevotestate') {
                        return 'VoteCompactUpdateVoteStateInstruction';
                    }
                    if (instruction.instructionType === 'compactupdatevotestateswitch') {
                        return 'VoteCompactUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.instructionType === 'withdraw') {
                        return 'VoteWithdrawInstruction';
                    }
                    if (instruction.instructionType === 'updateValidatorIdentity') {
                        return 'VoteUpdateValidatorIdentityInstruction';
                    }
                    if (instruction.instructionType === 'updateCommission') {
                        return 'VoteUpdateCommissionInstruction';
                    }
                    if (instruction.instructionType === 'voteSwitch') {
                        return 'VoteVoteSwitchInstruction';
                    }
                    if (instruction.instructionType === 'authorizeChecked') {
                        return 'VoteAuthorizeCheckedInstruction';
                    }
                }
            }
            return 'GenericInstruction';
        },
    },
    TransferInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
    },
    TransferWithSeedInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        sourceOwner: resolveAccount('sourceOwner'),
    },
    UpgradeNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    VoteAuthorizeCheckedInstruction: {
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeCheckedWithSeedInstruction: {
        authorityOwner: resolveAccount('authorityOwner'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeInstruction: {
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeWithSeedInstruction: {
        authorityOwner: resolveAccount('authorityOwner'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteCompactUpdateVoteStateInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteCompactUpdateVoteStateSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteInitializeAccountInstruction: {
        authorizedVoter: resolveAccount('authorizedVoter'),
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('node'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteUpdateCommissionInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateValidatorIdentityInstruction: {
        newValidatorIdentity: resolveAccount('newValidatorIdentity'),
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateVoteStateInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteUpdateVoteStateSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteVoteInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteVoteSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteWithdrawInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    WithdrawNonceAccountInstruction: {
        destination: resolveAccount('destination'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
};
