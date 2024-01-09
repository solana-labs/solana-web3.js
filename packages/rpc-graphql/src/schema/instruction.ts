/* eslint-disable sort-keys-fix/sort-keys-fix */

// *Note: Any integer value inside a transaction instruction must be `BigInt`
// until the following issue is resolved:
// <https://github.com/solana-labs/solana-web3.js/issues/1828>

import { resolveAccount } from '../resolvers/account';

export const instructionTypeDefs = /* GraphQL */ `
    """
    Transaction instruction interface
    """
    interface TransactionInstruction {
        programId: Address
    }

    """
    Generic transaction instruction
    """
    type GenericInstruction implements TransactionInstruction {
        accounts: [Address]
        data: Base64EncodedBytes
        programId: Address
    }

    """
    AddressLookupTable: CreateLookupTable instruction
    """
    type CreateLookupTableInstruction implements TransactionInstruction {
        programId: Address
        bumpSeed: BigInt # FIXME:*
        lookupTableAccount: Account
        lookupTableAuthority: Account
        payerAccount: Account
        recentSlot: BigInt
        systemProgram: Account
    }

    """
    AddressLookupTable: ExtendLookupTable instruction
    """
    type ExtendLookupTableInstruction implements TransactionInstruction {
        programId: Address
        lookupTableAccount: Account
        lookupTableAuthority: Account
        newAddresses: [Address]
        payerAccount: Account
        systemProgram: Account
    }

    """
    AddressLookupTable: FreezeLookupTable instruction
    """
    type FreezeLookupTableInstruction implements TransactionInstruction {
        programId: Address
        lookupTableAccount: Account
        lookupTableAuthority: Account
    }

    """
    AddressLookupTable: DeactivateLookupTable instruction
    """
    type DeactivateLookupTableInstruction implements TransactionInstruction {
        programId: Address
        lookupTableAccount: Account
        lookupTableAuthority: Account
    }

    """
    AddressLookupTable: CloseLookupTable instruction
    """
    type CloseLookupTableInstruction implements TransactionInstruction {
        programId: Address
        lookupTableAccount: Account
        lookupTableAuthority: Account
        recipient: Account
    }

    """
    BpfLoader: Write instruction
    """
    type BpfLoaderWriteInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        bytes: Base64EncodedBytes
        offset: BigInt # FIXME:*
    }

    """
    BpfLoader: Finalize instruction
    """
    type BpfLoaderFinalizeInstruction implements TransactionInstruction {
        programId: Address
        account: Account
    }

    """
    BpfUpgradeableLoader: InitializeBuffer instruction
    """
    type BpfUpgradeableLoaderInitializeBufferInstruction implements TransactionInstruction {
        programId: Address
        account: Account
    }

    """
    BpfUpgradeableLoader: Write instruction
    """
    type BpfUpgradeableLoaderWriteInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        bytes: Base64EncodedBytes
        offset: BigInt # FIXME:*
    }

    """
    BpfUpgradeableLoader: DeployWithMaxDataLen instruction
    """
    type BpfUpgradeableLoaderDeployWithMaxDataLenInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        bufferAccount: Account
        clockSysvar: Address
        maxDataLen: BigInt
        payerAccount: Account
        programAccount: Account
        programDataAccount: Account
        rentSysvar: Address
    }

    """
    BpfUpgradeableLoader: Upgrade instruction
    """
    type BpfUpgradeableLoaderUpgradeInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        bufferAccount: Account
        clockSysvar: Address
        programAccount: Account
        programDataAccount: Account
        rentSysvar: Address
        spillAccount: Account
    }

    """
    BpfUpgradeableLoader: SetAuthority instruction
    """
    type BpfUpgradeableLoaderSetAuthorityInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        newAuthority: Account
    }

    """
    BpfUpgradeableLoader: SetAuthorityChecked instruction
    """
    type BpfUpgradeableLoaderSetAuthorityCheckedInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        newAuthority: Account
    }

    """
    BpfUpgradeableLoader: Close instruction
    """
    type BpfUpgradeableLoaderCloseInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        programAccount: Account
        recipient: Account
    }

    """
    BpfUpgradeableLoader: ExtendProgram instruction
    """
    type BpfUpgradeableLoaderExtendProgramInstruction implements TransactionInstruction {
        programId: Address
        additionalBytes: BigInt
        payerAccount: Account
        programAccount: Account
        programDataAccount: Account
        systemProgram: Account
    }

    """
    SplAssociatedTokenAccount: Create instruction
    """
    type SplAssociatedTokenCreateInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        mint: Address
        source: Account
        systemProgram: Account
        tokenProgram: Account
        wallet: Account
    }

    """
    SplAssociatedTokenAccount: CreateIdempotent instruction
    """
    type SplAssociatedTokenCreateIdempotentInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        mint: Address
        source: Account
        systemProgram: Account
        tokenProgram: Account
        wallet: Account
    }

    """
    SplAssociatedTokenAccount: RecoverNested instruction
    """
    type SplAssociatedTokenRecoverNestedInstruction implements TransactionInstruction {
        programId: Address
        destination: Account
        nestedMint: Account
        nestedOwner: Account
        nestedSource: Account
        ownerMint: Account
        tokenProgram: Account
        wallet: Account
    }

    """
    SplMemo instruction
    """
    type SplMemoInstruction implements TransactionInstruction {
        programId: Address
        memo: String
    }

    """
    SplToken: InitializeMint instruction
    """
    type SplTokenInitializeMintInstruction implements TransactionInstruction {
        programId: Address
        decimals: BigInt # FIXME:*
        freezeAuthority: Account
        mint: Account
        mintAuthority: Account
        rentSysvar: Address
    }

    """
    SplToken: InitializeMint2 instruction
    """
    type SplTokenInitializeMint2Instruction implements TransactionInstruction {
        programId: Address
        decimals: BigInt # FIXME:*
        freezeAuthority: Account
        mint: Account
        mintAuthority: Account
    }

    """
    SplToken: InitializeAccount instruction
    """
    type SplTokenInitializeAccountInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        mint: Account
        owner: Account
        rentSysvar: Address
    }

    """
    SplToken: InitializeAccount2 instruction
    """
    type SplTokenInitializeAccount2Instruction implements TransactionInstruction {
        programId: Address
        account: Account
        mint: Account
        owner: Account
        rentSysvar: Address
    }

    """
    SplToken: InitializeAccount3 instruction
    """
    type SplTokenInitializeAccount3Instruction implements TransactionInstruction {
        programId: Address
        account: Account
        mint: Account
        owner: Account
    }

    """
    SplToken: InitializeMultisig instruction
    """
    type SplTokenInitializeMultisigInstruction implements TransactionInstruction {
        programId: Address
        m: BigInt # FIXME:*
        multisig: Account
        rentSysvar: Address
        signers: [Address]
    }

    """
    SplToken: InitializeMultisig2 instruction
    """
    type SplTokenInitializeMultisig2Instruction implements TransactionInstruction {
        programId: Address
        m: BigInt # FIXME:*
        multisig: Account
        signers: [Address]
    }

    """
    SplToken: Transfer instruction
    """
    type SplTokenTransferInstruction implements TransactionInstruction {
        programId: Address
        amount: String
        authority: Account
        destination: Account
        multisigAuthority: Account
        source: Account
    }

    """
    SplToken: Approve instruction
    """
    type SplTokenApproveInstruction implements TransactionInstruction {
        programId: Address
        amount: String
        delegate: Account
        multisigOwner: Account
        owner: Account
        source: Account
    }

    """
    SplToken: Revoke instruction
    """
    type SplTokenRevokeInstruction implements TransactionInstruction {
        programId: Address
        multisigOwner: Account
        owner: Account
        source: Account
    }

    """
    SplToken: SetAuthority instruction
    """
    type SplTokenSetAuthorityInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        authorityType: String
        multisigAuthority: Account
        newAuthority: Account
    }

    """
    SplToken: MintTo instruction
    """
    type SplTokenMintToInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        amount: String
        authority: Account
        mint: Account
        mintAuthority: Account
        multisigMintAuthority: Account
    }

    """
    SplToken: Burn instruction
    """
    type SplTokenBurnInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        amount: String
        authority: Account
        mint: Account
        multisigAuthority: Account
    }

    """
    SplToken: CloseAccount instruction
    """
    type SplTokenCloseAccountInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        destination: Account
        multisigOwner: Account
        owner: Account
    }

    """
    SplToken: FreezeAccount instruction
    """
    type SplTokenFreezeAccountInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        freezeAuthority: Account
        mint: Account
        multisigFreezeAuthority: Account
    }

    """
    SplToken: ThawAccount instruction
    """
    type SplTokenThawAccountInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        freezeAuthority: Account
        mint: Account
        multisigFreezeAuthority: Account
    }

    """
    SplToken: TransferChecked instruction
    """
    type SplTokenTransferCheckedInstruction implements TransactionInstruction {
        programId: Address
        amount: String
        authority: Account
        decimals: BigInt # FIXME:*
        destination: Account
        mint: Account
        multisigAuthority: Account
        source: Account
        tokenAmount: String
    }

    """
    SplToken: ApproveChecked instruction
    """
    type SplTokenApproveCheckedInstruction implements TransactionInstruction {
        programId: Address
        delegate: Account
        mint: Account
        multisigOwner: Account
        owner: Account
        source: Account
        tokenAmount: String
    }

    """
    SplToken: MintToChecked instruction
    """
    type SplTokenMintToCheckedInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        mint: Account
        mintAuthority: Account
        multisigMintAuthority: Account
        tokenAmount: String
    }

    """
    SplToken: BurnChecked instruction
    """
    type SplTokenBurnCheckedInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        authority: Account
        mint: Account
        multisigAuthority: Account
        tokenAmount: String
    }

    """
    SplToken: SyncNative instruction
    """
    type SplTokenSyncNativeInstruction implements TransactionInstruction {
        programId: Address
        account: Account
    }

    """
    SplToken: GetAccountDataSize instruction
    """
    type SplTokenGetAccountDataSizeInstruction implements TransactionInstruction {
        programId: Address
        extensionTypes: [String]
        mint: Account
    }

    """
    SplToken: InitializeImmutableOwner instruction
    """
    type SplTokenInitializeImmutableOwnerInstruction implements TransactionInstruction {
        programId: Address
        account: Account
    }

    """
    SplToken: AmountToUiAmount instruction
    """
    type SplTokenAmountToUiAmountInstruction implements TransactionInstruction {
        programId: Address
        amount: String
        mint: Account
    }

    """
    SplToken: UiAmountToAmount instruction
    """
    type SplTokenUiAmountToAmountInstruction implements TransactionInstruction {
        programId: Address
        mint: Account
        uiAmount: String
    }

    """
    SplToken: InitializeMintCloseAuthority instruction
    """
    type SplTokenInitializeMintCloseAuthorityInstruction implements TransactionInstruction {
        programId: Address
        mint: Account
        newAuthority: Account
    }

    # TODO: Extensions!
    # - TransferFeeExtension
    # - ConfidentialTransferFeeExtension
    # - DefaultAccountStateExtension
    # - Reallocate
    # - MemoTransferExtension
    # - CreateNativeMint
    # - InitializeNonTransferableMint
    # - InterestBearingMintExtension
    # - CpiGuardExtension
    # - InitializePermanentDelegate
    # - TransferHookExtension
    # - ConfidentialTransferFeeExtension
    # - WithdrawExcessLamports
    # - MetadataPointerExtension

    type Lockup {
        custodian: Account
        epoch: BigInt
        unixTimestamp: BigInt
    }

    """
    Stake: Initialize instruction
    """
    type StakeInitializeInstructionDataAuthorized {
        staker: Account
        withdrawer: Account
    }
    type StakeInitializeInstruction implements TransactionInstruction {
        programId: Address
        authorized: StakeInitializeInstructionDataAuthorized
        lockup: Lockup
        rentSysvar: Address
        stakeAccount: Account
    }

    """
    Stake: Authorize instruction
    """
    type StakeAuthorizeInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        authorityType: String
        clockSysvar: Address
        custodian: Account
        newAuthority: Account
        stakeAccount: Account
    }

    """
    Stake: DelegateStake instruction
    """
    type StakeDelegateStakeInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        stakeAccount: Account
        stakeAuthority: Account
        stakeConfigAccount: Account
        stakeHistorySysvar: Address
        voteAccount: Account
    }

    """
    Stake: Split instruction
    """
    type StakeSplitInstruction implements TransactionInstruction {
        programId: Address
        lamports: BigInt
        newSplitAccount: Account
        stakeAccount: Account
        stakeAuthority: Account
    }

    """
    Stake: Withdraw instruction
    """
    type StakeWithdrawInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        destination: Account
        lamports: BigInt
        stakeAccount: Account
        withdrawAuthority: Account
    }

    """
    Stake: Deactivate instruction
    """
    type StakeDeactivateInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        stakeAccount: Account
        stakeAuthority: Account
    }

    """
    Stake: SetLockup instruction
    """
    type StakeSetLockupInstruction implements TransactionInstruction {
        programId: Address
        custodian: Account
        lockup: Lockup
        stakeAccount: Account
    }

    """
    Stake: Merge instruction
    """
    type StakeMergeInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        destination: Account
        source: Account
        stakeAuthority: Account
        stakeHistorySysvar: Address
    }

    """
    Stake: AuthorizeWithSeed instruction
    """
    type StakeAuthorizeWithSeedInstruction implements TransactionInstruction {
        programId: Address
        authorityBase: Account
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: Address
        custodian: Account
        newAuthorized: Account
        stakeAccount: Account
    }

    """
    Stake: InitializeChecked instruction
    """
    type StakeInitializeCheckedInstructionDataAuthorized {
        staker: Account
        withdrawer: Account
    }
    type StakeInitializeCheckedInstruction implements TransactionInstruction {
        programId: Address
        authorized: StakeInitializeCheckedInstructionDataAuthorized
        lockup: Lockup
        rentSysvar: Address
        stakeAccount: Account
    }

    """
    Stake: AuthorizeChecked instruction
    """
    type StakeAuthorizeCheckedInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        authorityType: String
        clockSysvar: Address
        custodian: Account
        newAuthority: Account
        stakeAccount: Account
    }

    """
    Stake: AuthorizeCheckedWithSeed instruction
    """
    type StakeAuthorizeCheckedWithSeedInstruction implements TransactionInstruction {
        programId: Address
        authorityBase: Account
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: Address
        custodian: Account
        newAuthorized: Account
        stakeAccount: Account
    }

    """
    Stake: SetLockupChecked instruction
    """
    type StakeSetLockupCheckedInstruction implements TransactionInstruction {
        programId: Address
        custodian: Account
        lockup: Lockup
        stakeAccount: Account
    }

    """
    Stake: DeactivateDelinquent instruction
    """
    type StakeDeactivateDelinquentInstruction implements TransactionInstruction {
        programId: Address
        referenceVoteAccount: Account
        stakeAccount: Account
        voteAccount: Account
    }

    """
    Stake: Redelegate instruction
    """
    type StakeRedelegateInstruction implements TransactionInstruction {
        programId: Address
        newStakeAccount: Account
        stakeAccount: Account
        stakeAuthority: Account
        stakeConfigAccount: Account
        voteAccount: Account
    }

    """
    System: CreateAccount instruction
    """
    type CreateAccountInstruction implements TransactionInstruction {
        programId: Address
        lamports: BigInt
        newAccount: Account
        owner: Account
        source: Account
        space: BigInt
    }

    """
    System: Assign instruction
    """
    type AssignInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        owner: Account
    }

    """
    System: Transfer instruction
    """
    type TransferInstruction implements TransactionInstruction {
        programId: Address
        destination: Account
        lamports: BigInt
        source: Account
    }

    """
    System: CreateAccountWithSeed instruction
    """
    type CreateAccountWithSeedInstruction implements TransactionInstruction {
        programId: Address
        base: Account
        lamports: BigInt
        owner: Account
        seed: String
        space: BigInt
    }

    """
    System: AdvanceNonceAccount instruction
    """
    type AdvanceNonceAccountInstruction implements TransactionInstruction {
        programId: Address
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: Address
    }

    """
    System: WithdrawNonceAccount instruction
    """
    type WithdrawNonceAccountInstruction implements TransactionInstruction {
        programId: Address
        destination: Account
        lamports: BigInt
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: Address
        rentSysvar: Address
    }

    """
    System: InitializeNonceAccount instruction
    """
    type InitializeNonceAccountInstruction implements TransactionInstruction {
        programId: Address
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: Address
        rentSysvar: Address
    }

    """
    System: AuthorizeNonceAccount instruction
    """
    type AuthorizeNonceAccountInstruction implements TransactionInstruction {
        programId: Address
        newAuthorized: Account
        nonceAccount: Account
        nonceAuthority: Account
    }

    """
    System: UpgradeNonceAccount instruction
    """
    type UpgradeNonceAccountInstruction implements TransactionInstruction {
        programId: Address
        nonceAccount: Account
        nonceAuthority: Account
    }

    """
    System: Allocate instruction
    """
    type AllocateInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        space: BigInt
    }

    """
    System: AllocateWithSeed instruction
    """
    type AllocateWithSeedInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        base: Address
        owner: Account
        seed: String
        space: BigInt
    }

    """
    System: AssignWithSeed instruction
    """
    type AssignWithSeedInstruction implements TransactionInstruction {
        programId: Address
        account: Account
        base: Address
        owner: Account
        seed: String
    }

    """
    System: TransferWithSeed instruction
    """
    type TransferWithSeedInstruction implements TransactionInstruction {
        programId: Address
        destination: Account
        lamports: BigInt
        source: Account
        sourceBase: Address
        sourceOwner: Account
        sourceSeed: String
    }

    """
    Vote: InitializeAccount instruction
    """
    type VoteInitializeAccountInstruction implements TransactionInstruction {
        programId: Address
        authorizedVoter: Account
        authorizedWithdrawer: Account
        clockSysvar: Address
        commission: BigInt # FIXME:*
        node: Account
        rentSysvar: Address
        voteAccount: Account
    }

    """
    Vote: Authorize instruction
    """
    type VoteAuthorizeInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        authorityType: String
        clockSysvar: Address
        newAuthority: Account
        voteAccount: Account
    }

    """
    Vote: AuthorizeWithSeed instruction
    """
    type VoteAuthorizeWithSeedInstruction implements TransactionInstruction {
        programId: Address
        authorityBaseKey: String
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: Address
        newAuthority: Account
        voteAccount: Account
    }

    """
    Vote: AuthorizeCheckedWithSeed instruction
    """
    type VoteAuthorizeCheckedWithSeedInstruction implements TransactionInstruction {
        programId: Address
        authorityBaseKey: String
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: Address
        newAuthority: Account
        voteAccount: Account
    }

    type Vote {
        hash: String
        slots: [BigInt]
        timestamp: BigInt
    }

    """
    Vote: Vote instruction
    """
    type VoteVoteInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        slotHashesSysvar: Address
        vote: Vote
        voteAccount: Account
        voteAuthority: Account
    }

    type VoteStateUpdateLockout {
        confirmationCount: BigInt # FIXME:*
        slot: BigInt
    }
    type VoteStateUpdate {
        hash: String
        lockouts: [VoteStateUpdateLockout]
        root: BigInt
        timestamp: BigInt
    }

    """
    Vote: UpdateVoteState instruction
    """
    type VoteUpdateVoteStateInstruction implements TransactionInstruction {
        programId: Address
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }

    """
    Vote: UpdateVoteStateSwitch instruction
    """
    type VoteUpdateVoteStateSwitchInstruction implements TransactionInstruction {
        programId: Address
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }

    """
    Vote: CompactUpdateVoteState instruction
    """
    type VoteCompactUpdateVoteStateInstruction implements TransactionInstruction {
        programId: Address
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }

    """
    Vote: CompactUpdateVoteStateSwitch instruction
    """
    type VoteCompactUpdateVoteStateSwitchInstruction implements TransactionInstruction {
        programId: Address
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }

    """
    Vote: Withdraw instruction
    """
    type VoteWithdrawInstruction implements TransactionInstruction {
        programId: Address
        destination: Account
        lamports: BigInt
        voteAccount: Account
        withdrawAuthority: Account
    }

    """
    Vote: UpdateValidatorIdentity instruction
    """
    type VoteUpdateValidatorIdentityInstruction implements TransactionInstruction {
        programId: Address
        newValidatorIdentity: Account
        voteAccount: Account
        withdrawAuthority: Account
    }

    """
    Vote: UpdateCommission instruction
    """
    type VoteUpdateCommissionInstruction implements TransactionInstruction {
        programId: Address
        commission: BigInt # FIXME:*
        voteAccount: Account
        withdrawAuthority: Account
    }

    """
    Vote: VoteSwitch instruction
    """
    type VoteVoteSwitchInstruction implements TransactionInstruction {
        programId: Address
        clockSysvar: Address
        hash: String
        slotHashesSysvar: Address
        vote: Vote
        voteAccount: Account
        voteAuthority: Account
    }

    """
    Vote: AuthorizeChecked instruction
    """
    type VoteAuthorizeCheckedInstruction implements TransactionInstruction {
        programId: Address
        authority: Account
        authorityType: String
        clockSysvar: Address
        newAuthority: Account
        voteAccount: Account
    }
`;

export const instructionResolvers = {
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
    CreateLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        payerAccount: resolveAccount('payerAccount'),
        systemProgram: resolveAccount('systemProgram'),
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
    DeactivateLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
    },
    CloseLookupTableInstruction: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        recipient: resolveAccount('recipient'),
    },
    BpfLoaderWriteInstruction: {
        account: resolveAccount('account'),
    },
    BpfLoaderFinalizeInstruction: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderInitializeBufferInstruction: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderWriteInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
    },
    BpfUpgradeableLoaderDeployWithMaxDataLenInstruction: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderUpgradeInstruction: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderSetAuthorityInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderSetAuthorityCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderCloseInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        programAccount: resolveAccount('programAccount'),
        recipient: resolveAccount('recipient'),
    },
    BpfUpgradeableLoaderExtendProgramInstruction: {
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    SplAssociatedTokenCreateInstruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        source: resolveAccount('source'),
        systemProgram: resolveAccount('systemProgram'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplAssociatedTokenCreateIdempotentInstruction: {
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
    SplTokenInitializeMintInstruction: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeMint2Instruction: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeAccountInstruction: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
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
    SplTokenInitializeMultisigInstruction: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenInitializeMultisig2Instruction: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenTransferInstruction: {
        authority: resolveAccount('authority'),
        destination: resolveAccount('destination'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        source: resolveAccount('source'),
    },
    SplTokenApproveInstruction: {
        delegate: resolveAccount('delegate'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
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
    SplTokenMintToInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
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
    SplTokenApproveCheckedInstruction: {
        delegate: resolveAccount('delegate'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenMintToCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
    },
    SplTokenBurnCheckedInstruction: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenSyncNativeInstruction: {
        account: resolveAccount('account'),
    },
    SplTokenGetAccountDataSizeInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenAmountToUiAmountInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenUiAmountToAmountInstruction: {
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeMintCloseAuthorityInstruction: {
        mint: resolveAccount('mint'),
        newAuthority: resolveAccount('newAuthority'),
    },
    Lockup: {
        custodian: resolveAccount('custodian'),
    },
    StakeInitializeInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeInitializeInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeInstruction: {
        authority: resolveAccount('authority'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeDelegateStakeInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
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
    StakeDeactivateInstruction: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeSetLockupInstruction: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeMergeInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeAuthorizeWithSeedInstruction: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeInitializeCheckedInstructionDataAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
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
    StakeSetLockupCheckedInstruction: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeDeactivateDelinquentInstruction: {
        referenceVoteAccount: resolveAccount('referenceVoteAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeRedelegateInstruction: {
        newStakeAccount: resolveAccount('newStakeAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    CreateAccountInstruction: {
        newAccount: resolveAccount('newAccount'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    AssignInstruction: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    TransferInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
    },
    CreateAccountWithSeedInstruction: {
        base: resolveAccount('base'),
        owner: resolveAccount('owner'),
        seed: resolveAccount('seed'),
    },
    AdvanceNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    WithdrawNonceAccountInstruction: {
        destination: resolveAccount('destination'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    InitializeNonceAccountInstruction: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    AuthorizeNonceAccountInstruction: {
        newAuthorized: resolveAccount('newAuthorized'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    UpgradeNonceAccountInstruction: {
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
    AssignWithSeedInstruction: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    TransferWithSeedInstruction: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        sourceOwner: resolveAccount('sourceOwner'),
    },
    VoteInitializeAccountInstruction: {
        authorizedVoter: resolveAccount('authorizedVoter'),
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('node'),
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
    VoteAuthorizeCheckedWithSeedInstruction: {
        authorityOwner: resolveAccount('authorityOwner'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteVoteInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteUpdateVoteStateInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteUpdateVoteStateSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteCompactUpdateVoteStateInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteCompactUpdateVoteStateSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteWithdrawInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateValidatorIdentityInstruction: {
        newValidatorIdentity: resolveAccount('newValidatorIdentity'),
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateCommissionInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteVoteSwitchInstruction: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteAuthorizeCheckedInstruction: {
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
};
