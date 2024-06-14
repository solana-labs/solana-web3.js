import { resolveAccount } from '../../resolvers/account';
import { InstructionResult } from '../../resolvers/transaction';

export const instructionTypeResolvers = {
    AdvanceNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
        recentBlockhashesSysvar: resolveAccount('recentBlockhashesSysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
        rentSysvar: resolveAccount('rentSysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
        rentSysvar: resolveAccount('rentSysvar'),
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
        recentBlockhashesSysvar: resolveAccount('recentBlockhashesSysvar'),
        rentSysvar: resolveAccount('rentSysvar'),
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
    SplTokenApplyPendingConfidentialTransferBalance: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenApproveCheckedInstruction: {
        delegate: resolveAccount('delegate'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenApproveConfidentialTransferAccount: {
        account: resolveAccount('account'),
        confidentialTransferAuditorAuthority: resolveAccount('confidentialTransferAuditorAuthority'),
        mint: resolveAccount('mint'),
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
    SplTokenConfidentialTransfer: {
        destination: resolveAccount('destination'),
        instructionsSysvar: resolveAccount('instructionsSysvar'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenConfidentialTransferWithSplitProofs: {
        batchedGroupedCiphertext2HandlesValidityContext: resolveAccount(
            'batchedGroupedCiphertext2HandlesValidityContext',
        ),
        batchedRangeProofContext: resolveAccount('batchedRangeProofContext'),
        ciphertextCommitmentEqualityContext: resolveAccount('ciphertextCommitmentEqualityContext'),
        contextStateOwner: resolveAccount('contextStateOwner'),
        destination: resolveAccount('destination'),
        lamportDestination: resolveAccount('lamportDestination'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenConfigureConfidentialTransferAccount: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
    },
    SplTokenDepositConfidentialTransfer: {
        destination: resolveAccount('destination'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenDisableConfidentialTransferConfidentialCredits: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenDisableConfidentialTransferFeeHarvestToMint: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenDisableConfidentialTransferNonConfidentialCredits: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenDisableCpiGuardInstruction: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenDisableRequiredMemoTransfers: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEmptyConfidentialTransferAccount: {
        account: resolveAccount('account'),
        instructionsSysvar: resolveAccount('instructionsSysvar'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEnableConfidentialTransferConfidentialCredits: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEnableConfidentialTransferFeeHarvestToMint: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEnableConfidentialTransferNonConfidentialCredits: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEnableCpiGuardInstruction: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenEnableRequiredMemoTransfers: {
        account: resolveAccount('account'),
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
    SplTokenGroupInitializeGroup: {
        group: resolveAccount('group'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenGroupInitializeMember: {
        group: resolveAccount('group'),
        groupUpdateAuthority: resolveAccount('groupUpdateAuthority'),
        member: resolveAccount('member'),
        memberMint: resolveAccount('memberMint'),
        memberMintAuthority: resolveAccount('memberMintAuthority'),
    },
    SplTokenGroupUpdateGroupAuthority: {
        group: resolveAccount('group'),
        newAuthority: resolveAccount('newAuthority'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenGroupUpdateGroupMaxSize: {
        group: resolveAccount('group'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenHarvestWithheldConfidentialTransferTokensToMint: {
        mint: resolveAccount('mint'),
    },
    SplTokenHarvestWithheldTokensToMint: {
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeAccount2Instruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        rentSysvar: resolveAccount('rentSysvar'),
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
        rentSysvar: resolveAccount('rentSysvar'),
    },
    SplTokenInitializeConfidentialTransferFeeConfig: {
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeConfidentialTransferMint: {
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeDefaultAccountStateInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeGroupMemberPointerInstruction: {
        authority: resolveAccount('authority'),
        memberAddress: resolveAccount('memberAddress'),
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeGroupPointerInstruction: {
        authority: resolveAccount('authority'),
        groupAddress: resolveAccount('groupAddress'),
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeInterestBearingConfig: {
        mint: resolveAccount('mint'),
        rateAuthority: resolveAccount('rateAuthority'),
    },
    SplTokenInitializeMetadataPointerInstruction: {
        authority: resolveAccount('authority'),
        metadataAddress: resolveAccount('metadataAddress'),
        mint: resolveAccount('mint'),
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
        rentSysvar: resolveAccount('rentSysvar'),
    },
    SplTokenInitializeMultisig2Instruction: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenInitializeMultisigInstruction: {
        multisig: resolveAccount('multisig'),
        rentSysvar: resolveAccount('rentSysvar'),
    },
    SplTokenInitializePermanentDelegateInstruction: {
        delegate: resolveAccount('delegate'),
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeTransferFeeConfig: {
        mint: resolveAccount('mint'),
        transferFeeConfigAuthority: resolveAccount('transferFeeConfigAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    SplTokenInitializeTransferHookInstruction: {
        authority: resolveAccount('authority'),
        hookProgramId: resolveAccount('programId'),
        mint: resolveAccount('mint'),
    },
    SplTokenMetadataEmit: {
        metadata: resolveAccount('metadata'),
    },
    SplTokenMetadataInitialize: {
        metadata: resolveAccount('metadata'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenMetadataRemoveKey: {
        metadata: resolveAccount('metadata'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenMetadataUpdateAuthority: {
        metadata: resolveAccount('metadata'),
        newAuthority: resolveAccount('newAuthority'),
        updateAuthority: resolveAccount('updateAuthority'),
    },
    SplTokenMetadataUpdateField: {
        metadata: resolveAccount('metadata'),
        updateAuthority: resolveAccount('updateAuthority'),
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
    SplTokenReallocate: {
        account: resolveAccount('account'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        payer: resolveAccount('payer'),
        systemProgram: resolveAccount('systemProgram'),
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
    SplTokenTransferCheckedWithFee: {
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
    SplTokenUpdateConfidentialTransferMint: {
        authority: resolveAccount('authority'),
        confidentialTransferMintAuthority: resolveAccount('confidentialTransferMintAuthority'),
        mint: resolveAccount('mint'),
        newConfidentialTransferMintAuthority: resolveAccount('newConfidentialTransferMintAuthority'),
    },
    SplTokenUpdateDefaultAccountStateInstruction: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        multisigFreezeAuthority: resolveAccount('multisigFreezeAuthority'),
    },
    SplTokenUpdateGroupMemberPointerInstruction: {
        authority: resolveAccount('authority'),
        memberAddress: resolveAccount('memberAddress'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenUpdateGroupPointerInstruction: {
        authority: resolveAccount('authority'),
        groupAddress: resolveAccount('groupAddress'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenUpdateInterestBearingConfigRate: {
        mint: resolveAccount('mint'),
        multisigRateAuthority: resolveAccount('multisigRateAuthority'),
        rateAuthority: resolveAccount('rateAuthority'),
    },
    SplTokenUpdateMetadataPointerInstruction: {
        authority: resolveAccount('authority'),
        metadataAddress: resolveAccount('metadataAddress'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenUpdateTransferHookInstruction: {
        authority: resolveAccount('authority'),
        hookProgramId: resolveAccount('programId'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenWithdrawConfidentialTransfer: {
        destination: resolveAccount('destination'),
        instructionsSysvar: resolveAccount('instructionsSysvar'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenWithdrawWithheldConfidentialTransferTokensFromAccounts: {
        feeRecipient: resolveAccount('feeRecipient'),
        instructionsSysvar: resolveAccount('instructionsSysvar'),
        mint: resolveAccount('mint'),
        multisigWithdrawWithheldAuthority: resolveAccount('multisigWithdrawWithheldAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    SplTokenWithdrawWithheldConfidentialTransferTokensFromMint: {
        feeRecipient: resolveAccount('feeRecipient'),
        instructionsSysvar: resolveAccount('instructionsSysvar'),
        mint: resolveAccount('mint'),
        multisigWithdrawWithheldAuthority: resolveAccount('multisigWithdrawWithheldAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    SplTokenWithdrawWithheldTokensFromAccounts: {
        feeRecipient: resolveAccount('feeRecipient'),
        mint: resolveAccount('mint'),
        multisigWithdrawWithheldAuthority: resolveAccount('multisigWithdrawWithheldAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    SplTokenWithdrawWithheldTokensFromMint: {
        feeRecipient: resolveAccount('feeRecipient'),
        mint: resolveAccount('mint'),
        multisigWithdrawWithheldAuthority: resolveAccount('multisigWithdrawWithheldAuthority'),
        withdrawWithheldAuthority: resolveAccount('withdrawWithheldAuthority'),
    },
    StakeAuthorizeCheckedInstruction: {
        authority: resolveAccount('authority'),
        clockSysvar: resolveAccount('clockSysvar'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeCheckedWithSeedInstruction: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        clockSysvar: resolveAccount('clockSysvar'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeInstruction: {
        authority: resolveAccount('authority'),
        clockSysvar: resolveAccount('clockSysvar'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeWithSeedInstruction: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        clockSysvar: resolveAccount('clockSysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeDelegateStakeInstruction: {
        clockSysvar: resolveAccount('clockSysvar'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        stakeHistorySysvar: resolveAccount('stakeHistorySysvar'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeInitializeCheckedInstruction: {
        rentSysvar: resolveAccount('rentSysvar'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeInitializeCheckedInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeInitializeInstruction: {
        rentSysvar: resolveAccount('rentSysvar'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeInitializeInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeMergeInstruction: {
        clockSysvar: resolveAccount('clockSysvar'),
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeHistorySysvar: resolveAccount('stakeHistorySysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        destination: resolveAccount('destination'),
        stakeAccount: resolveAccount('stakeAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    TransactionInstruction: {
        __resolveType(instructionResult: InstructionResult) {
            const { jsonParsedConfigs } = instructionResult;
            if (jsonParsedConfigs) {
                if (jsonParsedConfigs.programName === 'address-lookup-table') {
                    if (jsonParsedConfigs.instructionType === 'createLookupTable') {
                        return 'CreateLookupTableInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'freezeLookupTable') {
                        return 'FreezeLookupTableInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'extendLookupTable') {
                        return 'ExtendLookupTableInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'deactivateLookupTable') {
                        return 'DeactivateLookupTableInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'closeLookupTable') {
                        return 'CloseLookupTableInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'bpf-loader') {
                    if (jsonParsedConfigs.instructionType === 'write') {
                        return 'BpfLoaderWriteInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'finalize') {
                        return 'BpfLoaderFinalizeInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'bpf-upgradeable-loader') {
                    if (jsonParsedConfigs.instructionType === 'initializeBuffer') {
                        return 'BpfUpgradeableLoaderInitializeBufferInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'write') {
                        return 'BpfUpgradeableLoaderWriteInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'deployWithMaxDataLen') {
                        return 'BpfUpgradeableLoaderDeployWithMaxDataLenInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'upgrade') {
                        return 'BpfUpgradeableLoaderUpgradeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'setAuthority') {
                        return 'BpfUpgradeableLoaderSetAuthorityInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'setAuthorityChecked') {
                        return 'BpfUpgradeableLoaderSetAuthorityCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'close') {
                        return 'BpfUpgradeableLoaderCloseInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'extendProgram') {
                        return 'BpfUpgradeableLoaderExtendProgramInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'spl-associated-token-account') {
                    if (jsonParsedConfigs.instructionType === 'create') {
                        return 'SplAssociatedTokenCreateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'createIdempotent') {
                        return 'SplAssociatedTokenCreateIdempotentInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'recoverNested') {
                        return 'SplAssociatedTokenRecoverNestedInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'spl-memo') {
                    return 'SplMemoInstruction';
                }
                if (jsonParsedConfigs.programName === 'spl-token') {
                    if (jsonParsedConfigs.instructionType === 'initializeMint') {
                        return 'SplTokenInitializeMintInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeMint2') {
                        return 'SplTokenInitializeMint2Instruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeAccount') {
                        return 'SplTokenInitializeAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeAccount2') {
                        return 'SplTokenInitializeAccount2Instruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeAccount3') {
                        return 'SplTokenInitializeAccount3Instruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeMultisig') {
                        return 'SplTokenInitializeMultisigInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeMultisig2') {
                        return 'SplTokenInitializeMultisig2Instruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'transfer') {
                        return 'SplTokenTransferInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'approve') {
                        return 'SplTokenApproveInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'revoke') {
                        return 'SplTokenRevokeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'setAuthority') {
                        return 'SplTokenSetAuthorityInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'mintTo') {
                        return 'SplTokenMintToInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'burn') {
                        return 'SplTokenBurnInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'closeAccount') {
                        return 'SplTokenCloseAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'freezeAccount') {
                        return 'SplTokenFreezeAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'thawAccount') {
                        return 'SplTokenThawAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'transferChecked') {
                        return 'SplTokenTransferCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'approveChecked') {
                        return 'SplTokenApproveCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'mintToChecked') {
                        return 'SplTokenMintToCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'burnChecked') {
                        return 'SplTokenBurnCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'syncNative') {
                        return 'SplTokenSyncNativeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'getAccountDataSize') {
                        return 'SplTokenGetAccountDataSizeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeImmutableOwner') {
                        return 'SplTokenInitializeImmutableOwnerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'amountToUiAmount') {
                        return 'SplTokenAmountToUiAmountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'uiAmountToAmount') {
                        return 'SplTokenUiAmountToAmountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeMintCloseAuthority') {
                        return 'SplTokenInitializeMintCloseAuthorityInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializePermanentDelegate') {
                        return 'SplTokenInitializePermanentDelegateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeGroupPointer') {
                        return 'SplTokenInitializeGroupPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateGroupPointer') {
                        return 'SplTokenUpdateGroupPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeGroupMemberPointer') {
                        return 'SplTokenInitializeGroupMemberPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateGroupMemberPointer') {
                        return 'SplTokenUpdateGroupMemberPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeMetadataPointer') {
                        return 'SplTokenInitializeMetadataPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateMetadataPointer') {
                        return 'SplTokenUpdateMetadataPointerInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeTransferFeeConfig') {
                        return 'SplTokenInitializeTransferFeeConfig';
                    }
                    if (jsonParsedConfigs.instructionType === 'transferCheckedWithFee') {
                        return 'SplTokenTransferCheckedWithFee';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeTransferHook') {
                        return 'SplTokenInitializeTransferHookInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateTransferHook') {
                        return 'SplTokenUpdateTransferHookInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeDefaultAccountState') {
                        return 'SplTokenInitializeDefaultAccountStateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateDefaultAccountState') {
                        return 'SplTokenUpdateDefaultAccountStateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'disableCpiGuard') {
                        return 'SplTokenDisableCpiGuardInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'enableCpiGuard') {
                        return 'SplTokenEnableCpiGuardInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'harvestWithheldTokensToMint') {
                        return 'SplTokenHarvestWithheldTokensToMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdrawWithheldTokensFromAccounts') {
                        return 'SplTokenWithdrawWithheldTokensFromAccounts';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdrawWithheldTokensFromMint') {
                        return 'SplTokenWithdrawWithheldTokensFromMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'enableRequiredMemoTransfers') {
                        return 'SplTokenEnableRequiredMemoTransfers';
                    }
                    if (jsonParsedConfigs.instructionType === 'disableRequiredMemoTransfers') {
                        return 'SplTokenDisableRequiredMemoTransfers';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeConfidentialTransferMint') {
                        return 'SplTokenInitializeConfidentialTransferMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeInterestBearingConfig') {
                        return 'SplTokenInitializeInterestBearingConfig';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateInterestBearingConfigRate') {
                        return 'SplTokenUpdateInterestBearingConfigRate';
                    }
                    if (jsonParsedConfigs.instructionType === 'approveConfidentialTransferAccount') {
                        return 'SplTokenApproveConfidentialTransferAccount';
                    }
                    if (jsonParsedConfigs.instructionType === 'emptyConfidentialTransferAccount') {
                        return 'SplTokenEmptyConfidentialTransferAccount';
                    }
                    if (jsonParsedConfigs.instructionType === 'configureConfidentialTransferAccount') {
                        return 'SplTokenConfigureConfidentialTransferAccount';
                    }
                    if (jsonParsedConfigs.instructionType === 'applyPendingConfidentialTransferBalance') {
                        return 'SplTokenApplyPendingConfidentialTransferBalance';
                    }
                    if (jsonParsedConfigs.instructionType === 'enableConfidentialTransferConfidentialCredits') {
                        return 'SplTokenEnableConfidentialTransferConfidentialCredits';
                    }
                    if (jsonParsedConfigs.instructionType === 'disableConfidentialTransferConfidentialCredits') {
                        return 'SplTokenDisableConfidentialTransferConfidentialCredits';
                    }
                    if (jsonParsedConfigs.instructionType === 'enableConfidentialTransferNonConfidentialCredits') {
                        return 'SplTokenEnableConfidentialTransferNonConfidentialCredits';
                    }
                    if (jsonParsedConfigs.instructionType === 'disableNonConfidentialTransferConfidentialCredits') {
                        return 'SplTokenDisableConfidentialTransferNonConfidentialCredits';
                    }
                    if (jsonParsedConfigs.instructionType === 'depositConfidentialTransfer') {
                        return 'SplTokenDepositConfidentialTransfer';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdrawConfidentialTransfer') {
                        return 'SplTokenWithdrawConfidentialTransfer';
                    }
                    if (jsonParsedConfigs.instructionType === 'confidentialTransfer') {
                        return 'SplTokenConfidentialTransfer';
                    }
                    if (jsonParsedConfigs.instructionType === 'confidentialTransferWithSplitProofs') {
                        return 'SplTokenConfidentialTransferWithSplitProofs';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateConfidentialTransferMint') {
                        return 'SplTokenUpdateConfidentialTransferMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdrawWithheldConfidentialTransferTokensFromMint') {
                        return 'SplTokenWithdrawWithheldConfidentialTransferTokensFromMint';
                    }
                    if (
                        jsonParsedConfigs.instructionType === 'withdrawWithheldConfidentialTransferTokensFromAccounts'
                    ) {
                        return 'SplTokenWithdrawWithheldConfidentialTransferTokensFromAccounts';
                    }
                    if (jsonParsedConfigs.instructionType === 'harvestWithheldConfidentialTransferTokensToMint') {
                        return 'SplTokenHarvestWithheldConfidentialTransferTokensToMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'enableConfidentialTransferFeeHarvestToMint') {
                        return 'SplTokenEnableConfidentialTransferFeeHarvestToMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'disableConfidentialTransferFeeHarvestToMint') {
                        return 'SplTokenDisableConfidentialTransferFeeHarvestToMint';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeConfidentialTransferFeeConfig') {
                        return 'SplTokenInitializeConfidentialTransferFeeConfig';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeTokenGroup') {
                        return 'SplTokenGroupInitializeGroup';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateTokenGroupMaxSize') {
                        return 'SplTokenGroupUpdateGroupMaxSize';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateTokenGroupAuthority') {
                        return 'SplTokenGroupUpdateGroupAuthority';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeTokenGroupMember') {
                        return 'SplTokenGroupInitializeMember';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeTokenMetadata') {
                        return 'SplTokenMetadataInitialize';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateTokenMetadataField') {
                        return 'SplTokenMetadataUpdateField';
                    }
                    if (jsonParsedConfigs.instructionType === 'removeTokenMetadataKey') {
                        return 'SplTokenMetadataRemoveKey';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateTokenMetadataAuthority') {
                        return 'SplTokenMetadataUpdateAuthority';
                    }
                    if (jsonParsedConfigs.instructionType === 'emitTokenMetadata') {
                        return 'SplTokenMetadataEmit';
                    }
                    if (jsonParsedConfigs?.instructionType === 'reallocate') {
                        return 'SplTokenReallocate';
                    }
                }
                if (jsonParsedConfigs.programName === 'stake') {
                    if (jsonParsedConfigs.instructionType === 'initialize') {
                        return 'StakeInitializeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorize') {
                        return 'StakeAuthorizeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'delegate') {
                        return 'StakeDelegateStakeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'split') {
                        return 'StakeSplitInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdraw') {
                        return 'StakeWithdrawInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'deactivate') {
                        return 'StakeDeactivateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'setLockup') {
                        return 'StakeSetLockupInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'merge') {
                        return 'StakeMergeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeWithSeed') {
                        return 'StakeAuthorizeWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeChecked') {
                        return 'StakeInitializeCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeChecked') {
                        return 'StakeAuthorizeCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeCheckedWithSeed') {
                        return 'StakeAuthorizeCheckedWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'setLockupChecked') {
                        return 'StakeSetLockupCheckedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'deactivateDelinquent') {
                        return 'StakeDeactivateDelinquentInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'redelegate') {
                        return 'StakeRedelegateInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'system') {
                    if (jsonParsedConfigs.instructionType === 'createAccount') {
                        return 'CreateAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'assign') {
                        return 'AssignInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'transfer') {
                        return 'TransferInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'createAccountWithSeed') {
                        return 'CreateAccountWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'advanceNonceAccount') {
                        return 'AdvanceNonceAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdrawNonceAccount') {
                        return 'WithdrawNonceAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'initializeNonceAccount') {
                        return 'InitializeNonceAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeNonceAccount') {
                        return 'AuthorizeNonceAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'upgradeNonceAccount') {
                        return 'UpgradeNonceAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'allocate') {
                        return 'AllocateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'allocateWithSeed') {
                        return 'AllocateWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'assignWithSeed') {
                        return 'AssignWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'transferWithSeed') {
                        return 'TransferWithSeedInstruction';
                    }
                }
                if (jsonParsedConfigs.programName === 'vote') {
                    if (jsonParsedConfigs.instructionType === 'initialize') {
                        return 'VoteInitializeAccountInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorize') {
                        return 'VoteAuthorizeInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeWithSeed') {
                        return 'VoteAuthorizeWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeCheckedWithSeed') {
                        return 'VoteAuthorizeCheckedWithSeedInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'vote') {
                        return 'VoteVoteInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updatevotestate') {
                        return 'VoteUpdateVoteStateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updatevotestateswitch') {
                        return 'VoteUpdateVoteStateSwitchInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'compactupdatevotestate') {
                        return 'VoteCompactUpdateVoteStateInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'compactupdatevotestateswitch') {
                        return 'VoteCompactUpdateVoteStateSwitchInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'withdraw') {
                        return 'VoteWithdrawInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateValidatorIdentity') {
                        return 'VoteUpdateValidatorIdentityInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'updateCommission') {
                        return 'VoteUpdateCommissionInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'voteSwitch') {
                        return 'VoteVoteSwitchInstruction';
                    }
                    if (jsonParsedConfigs.instructionType === 'authorizeChecked') {
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
        clockSysvar: resolveAccount('clockSysvar'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeCheckedWithSeedInstruction: {
        authorityOwner: resolveAccount('authorityOwner'),
        clockSysvar: resolveAccount('clockSysvar'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeInstruction: {
        authority: resolveAccount('authority'),
        clockSysvar: resolveAccount('clockSysvar'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeWithSeedInstruction: {
        authorityOwner: resolveAccount('authorityOwner'),
        clockSysvar: resolveAccount('clockSysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        node: resolveAccount('node'),

        rentSysvar: resolveAccount('rentSysvar'),
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
        clockSysvar: resolveAccount('clockSysvar'),
        slotHashesSysvar: resolveAccount('slotHashesSysvar'),
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteVoteSwitchInstruction: {
        clockSysvar: resolveAccount('clockSysvar'),
        slotHashesSysvar: resolveAccount('slotHashesSysvar'),
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
        recentBlockhashesSysvar: resolveAccount('recentBlockhashesSysvar'),
        rentSysvar: resolveAccount('rentSysvar'),
    },
};
