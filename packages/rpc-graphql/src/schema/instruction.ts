/* eslint-disable sort-keys-fix/sort-keys-fix */

// *Note: Any integer value inside a transaction instruction must be `BigInt`
// until the following issue is resolved:
// <https://github.com/solana-labs/solana-web3.js/issues/1828>

import { resolveAccount } from '../resolvers/account';

export const instructionTypeDefs = /* GraphQL */ `
    type JsonParsedInstructionMeta {
        program: String
        type: String
    }

    # Transaction instruction interface
    interface TransactionInstruction {
        programId: String
    }

    # Generic transaction instruction
    type GenericInstruction implements TransactionInstruction {
        accounts: [String]
        data: String
        programId: String
    }

    # AddressLookupTable: CreateLookupTable
    type CreateLookupTableInstructionData {
        bumpSeed: BigInt # FIXME:*
        lookupTableAccount: Account
        lookupTableAuthority: Account
        payerAccount: Account
        recentSlot: BigInt
        systemProgram: Account
    }
    type CreateLookupTableInstruction implements TransactionInstruction {
        data: CreateLookupTableInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # AddressLookupTable: ExtendLookupTable
    type ExtendLookupTableInstructionData {
        lookupTableAccount: Account
        lookupTableAuthority: Account
        newAddresses: [String]
        payerAccount: Account
        systemProgram: Account
    }
    type ExtendLookupTableInstruction implements TransactionInstruction {
        data: ExtendLookupTableInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # AddressLookupTable: FreezeLookupTable
    type FreezeLookupTableInstructionData {
        lookupTableAccount: Account
        lookupTableAuthority: Account
    }
    type FreezeLookupTableInstruction implements TransactionInstruction {
        data: FreezeLookupTableInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # AddressLookupTable: DeactivateLookupTable
    type DeactivateLookupTableInstructionData {
        lookupTableAccount: Account
        lookupTableAuthority: Account
    }
    type DeactivateLookupTableInstruction implements TransactionInstruction {
        data: DeactivateLookupTableInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # AddressLookupTable: CloseLookupTable
    type CloseLookupTableInstructionData {
        lookupTableAccount: Account
        lookupTableAuthority: Account
        recipient: Account
    }
    type CloseLookupTableInstruction implements TransactionInstruction {
        data: CloseLookupTableInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfLoader: Write
    type BpfLoaderWriteInstructionData {
        account: Account
        bytes: String
        offset: BigInt # FIXME:*
    }
    type BpfLoaderWriteInstruction implements TransactionInstruction {
        data: BpfLoaderWriteInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfLoader: Finalize
    type BpfLoaderFinalizeInstructionData {
        account: Account
    }
    type BpfLoaderFinalizeInstruction implements TransactionInstruction {
        data: BpfLoaderFinalizeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: InitializeBuffer
    type BpfUpgradeableLoaderInitializeBufferInstructionData {
        account: Account
    }
    type BpfUpgradeableLoaderInitializeBufferInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderInitializeBufferInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: Write
    type BpfUpgradeableLoaderWriteInstructionData {
        account: Account
        authority: Account
        bytes: String
        offset: BigInt # FIXME:*
    }
    type BpfUpgradeableLoaderWriteInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderWriteInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: DeployWithMaxDataLen
    type BpfUpgradeableLoaderDeployWithMaxDataLenInstructionData {
        authority: Account
        bufferAccount: Account
        clockSysvar: String
        maxDataLen: BigInt
        payerAccount: Account
        programAccount: Account
        programDataAccount: Account
        rentSysvar: String
    }
    type BpfUpgradeableLoaderDeployWithMaxDataLenInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderDeployWithMaxDataLenInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: Upgrade
    type BpfUpgradeableLoaderUpgradeInstructionData {
        authority: Account
        bufferAccount: Account
        clockSysvar: String
        programAccount: Account
        programDataAccount: Account
        rentSysvar: String
        spillAccount: Account
    }
    type BpfUpgradeableLoaderUpgradeInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderUpgradeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: SetAuthority
    type BpfUpgradeableLoaderSetAuthorityInstructionData {
        account: Account
        authority: Account
        newAuthority: Account
    }
    type BpfUpgradeableLoaderSetAuthorityInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderSetAuthorityInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: SetAuthorityChecked
    type BpfUpgradeableLoaderSetAuthorityCheckedInstructionData {
        account: Account
        authority: Account
        newAuthority: Account
    }
    type BpfUpgradeableLoaderSetAuthorityCheckedInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderSetAuthorityCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: Close
    type BpfUpgradeableLoaderCloseInstructionData {
        account: Account
        authority: Account
        programAccount: Account
        recipient: Account
    }
    type BpfUpgradeableLoaderCloseInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderCloseInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # BpfUpgradeableLoader: ExtendProgram
    type BpfUpgradeableLoaderExtendProgramInstructionData {
        additionalBytes: BigInt
        payerAccount: Account
        programAccount: Account
        programDataAccount: Account
        systemProgram: Account
    }
    type BpfUpgradeableLoaderExtendProgramInstruction implements TransactionInstruction {
        data: BpfUpgradeableLoaderExtendProgramInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplAssociatedTokenAccount: Create
    type SplAssociatedTokenCreateInstructionData {
        account: Account
        mint: String
        source: Account
        systemProgram: Account
        tokenProgram: Account
        wallet: Account
    }
    type SplAssociatedTokenCreateInstruction implements TransactionInstruction {
        data: SplAssociatedTokenCreateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplAssociatedTokenAccount: CreateIdempotent
    type SplAssociatedTokenCreateIdempotentInstructionData {
        account: Account
        mint: String
        source: Account
        systemProgram: Account
        tokenProgram: Account
        wallet: Account
    }
    type SplAssociatedTokenCreateIdempotentInstruction implements TransactionInstruction {
        data: SplAssociatedTokenCreateIdempotentInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplAssociatedTokenAccount: RecoverNested
    type SplAssociatedTokenRecoverNestedInstructionData {
        destination: Account
        nestedMint: Account
        nestedOwner: Account
        nestedSource: Account
        ownerMint: Account
        tokenProgram: Account
        wallet: Account
    }
    type SplAssociatedTokenRecoverNestedInstruction implements TransactionInstruction {
        data: SplAssociatedTokenRecoverNestedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplMemo
    type SplMemoInstructionData {
        data: String
    }
    type SplMemoInstruction implements TransactionInstruction {
        data: SplMemoInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeMint
    type SplTokenInitializeMintInstructionData {
        decimals: BigInt # FIXME:*
        freezeAuthority: Account
        mint: Account
        mintAuthority: Account
        rentSysvar: String
    }
    type SplTokenInitializeMintInstruction implements TransactionInstruction {
        data: SplTokenInitializeMintInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeMint2
    type SplTokenInitializeMint2InstructionData {
        decimals: BigInt # FIXME:*
        freezeAuthority: Account
        mint: Account
        mintAuthority: Account
    }
    type SplTokenInitializeMint2Instruction implements TransactionInstruction {
        data: SplTokenInitializeMint2InstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeAccount
    type SplTokenInitializeAccountInstructionData {
        account: Account
        mint: Account
        owner: Account
        rentSysvar: String
    }
    type SplTokenInitializeAccountInstruction implements TransactionInstruction {
        data: SplTokenInitializeAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeAccount2
    type SplTokenInitializeAccount2InstructionData {
        account: Account
        mint: Account
        owner: Account
        rentSysvar: String
    }
    type SplTokenInitializeAccount2Instruction implements TransactionInstruction {
        data: SplTokenInitializeAccount2InstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeAccount3
    type SplTokenInitializeAccount3InstructionData {
        account: Account
        mint: Account
        owner: Account
    }
    type SplTokenInitializeAccount3Instruction implements TransactionInstruction {
        data: SplTokenInitializeAccount3InstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeMultisig
    type SplTokenInitializeMultisigInstructionData {
        m: BigInt # FIXME:*
        multisig: Account
        rentSysvar: String
        signers: [String]
    }
    type SplTokenInitializeMultisigInstruction implements TransactionInstruction {
        data: SplTokenInitializeMultisigInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeMultisig2
    type SplTokenInitializeMultisig2InstructionData {
        m: BigInt # FIXME:*
        multisig: Account
        signers: [String]
    }
    type SplTokenInitializeMultisig2Instruction implements TransactionInstruction {
        data: SplTokenInitializeMultisig2InstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: Transfer
    type SplTokenTransferInstructionData {
        amount: String
        authority: Account
        destination: Account
        multisigAuthority: Account
        source: Account
    }
    type SplTokenTransferInstruction implements TransactionInstruction {
        data: SplTokenTransferInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: Approve
    type SplTokenApproveInstructionData {
        amount: String
        delegate: Account
        multisigOwner: Account
        owner: Account
        source: Account
    }
    type SplTokenApproveInstruction implements TransactionInstruction {
        data: SplTokenApproveInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: Revoke
    type SplTokenRevokeInstructionData {
        multisigOwner: Account
        owner: Account
        source: Account
    }
    type SplTokenRevokeInstruction implements TransactionInstruction {
        data: SplTokenRevokeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: SetAuthority
    type SplTokenSetAuthorityInstructionData {
        authority: Account
        authorityType: String
        multisigAuthority: Account
        newAuthority: Account
    }
    type SplTokenSetAuthorityInstruction implements TransactionInstruction {
        data: SplTokenSetAuthorityInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: MintTo
    type SplTokenMintToInstructionData {
        account: Account
        amount: String
        authority: Account
        mint: Account
        mintAuthority: Account
        multisigMintAuthority: Account
    }
    type SplTokenMintToInstruction implements TransactionInstruction {
        data: SplTokenMintToInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: Burn
    type SplTokenBurnInstructionData {
        account: Account
        amount: String
        authority: Account
        mint: Account
        multisigAuthority: Account
    }
    type SplTokenBurnInstruction implements TransactionInstruction {
        data: SplTokenBurnInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: CloseAccount
    type SplTokenCloseAccountInstructionData {
        account: Account
        destination: Account
        multisigOwner: Account
        owner: Account
    }
    type SplTokenCloseAccountInstruction implements TransactionInstruction {
        data: SplTokenCloseAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: FreezeAccount
    type SplTokenFreezeAccountInstructionData {
        account: Account
        freezeAuthority: Account
        mint: Account
        multisigFreezeAuthority: Account
    }
    type SplTokenFreezeAccountInstruction implements TransactionInstruction {
        data: SplTokenFreezeAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: ThawAccount
    type SplTokenThawAccountInstructionData {
        account: Account
        freezeAuthority: Account
        mint: Account
        multisigFreezeAuthority: Account
    }
    type SplTokenThawAccountInstruction implements TransactionInstruction {
        data: SplTokenThawAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: TransferChecked
    type SplTokenTransferCheckedInstructionData {
        amount: String
        authority: Account
        decimals: BigInt # FIXME:*
        destination: Account
        mint: Account
        multisigAuthority: Account
        source: Account
        tokenAmount: String
    }
    type SplTokenTransferCheckedInstruction implements TransactionInstruction {
        data: SplTokenTransferCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: ApproveChecked
    type SplTokenApproveCheckedInstructionData {
        delegate: Account
        mint: Account
        multisigOwner: Account
        owner: Account
        source: Account
        tokenAmount: String
    }
    type SplTokenApproveCheckedInstruction implements TransactionInstruction {
        data: SplTokenApproveCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: MintToChecked
    type SplTokenMintToCheckedInstructionData {
        account: Account
        authority: Account
        mint: Account
        mintAuthority: Account
        multisigMintAuthority: Account
        tokenAmount: String
    }
    type SplTokenMintToCheckedInstruction implements TransactionInstruction {
        data: SplTokenMintToCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: BurnChecked
    type SplTokenBurnCheckedInstructionData {
        account: Account
        authority: Account
        mint: Account
        multisigAuthority: Account
        tokenAmount: String
    }
    type SplTokenBurnCheckedInstruction implements TransactionInstruction {
        data: SplTokenBurnCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: SyncNative
    type SplTokenSyncNativeInstructionData {
        account: Account
    }
    type SplTokenSyncNativeInstruction implements TransactionInstruction {
        data: SplTokenSyncNativeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: GetAccountDataSize
    type SplTokenGetAccountDataSizeInstructionData {
        extensionTypes: [String]
        mint: Account
    }
    type SplTokenGetAccountDataSizeInstruction implements TransactionInstruction {
        data: SplTokenGetAccountDataSizeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeImmutableOwner
    type SplTokenInitializeImmutableOwnerInstructionData {
        account: Account
    }
    type SplTokenInitializeImmutableOwnerInstruction implements TransactionInstruction {
        data: SplTokenInitializeImmutableOwnerInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: AmountToUiAmount
    type SplTokenAmountToUiAmountInstructionData {
        amount: String
        mint: Account
    }
    type SplTokenAmountToUiAmountInstruction implements TransactionInstruction {
        data: SplTokenAmountToUiAmountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: UiAmountToAmount
    type SplTokenUiAmountToAmountInstructionData {
        mint: Account
        uiAmount: String
    }
    type SplTokenUiAmountToAmountInstruction implements TransactionInstruction {
        data: SplTokenUiAmountToAmountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # SplToken: InitializeMintCloseAuthority
    type SplTokenInitializeMintCloseAuthorityInstructionData {
        mint: Account
        newAuthority: Account
    }
    type SplTokenInitializeMintCloseAuthorityInstruction implements TransactionInstruction {
        data: SplTokenInitializeMintCloseAuthorityInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
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

    # Stake: Initialize
    type StakeInitializeInstructionDataAuthorized {
        staker: Account
        withdrawer: Account
    }
    type StakeInitializeInstructionData {
        authorized: StakeInitializeInstructionDataAuthorized
        lockup: Lockup
        rentSysvar: String
        stakeAccount: Account
    }
    type StakeInitializeInstruction implements TransactionInstruction {
        data: StakeInitializeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Authorize
    type StakeAuthorizeInstructionData {
        authority: Account
        authorityType: String
        clockSysvar: String
        custodian: Account
        newAuthority: Account
        stakeAccount: Account
    }
    type StakeAuthorizeInstruction implements TransactionInstruction {
        data: StakeAuthorizeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: DelegateStake
    type StakeDelegateStakeInstructionData {
        clockSysvar: String
        stakeAccount: Account
        stakeAuthority: Account
        stakeConfigAccount: Account
        stakeHistorySysvar: String
        voteAccount: Account
    }
    type StakeDelegateStakeInstruction implements TransactionInstruction {
        data: StakeDelegateStakeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Split
    type StakeSplitInstructionData {
        lamports: BigInt
        newSplitAccount: Account
        stakeAccount: Account
        stakeAuthority: Account
    }
    type StakeSplitInstruction implements TransactionInstruction {
        data: StakeSplitInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Withdraw
    type StakeWithdrawInstructionData {
        clockSysvar: String
        destination: Account
        lamports: BigInt
        stakeAccount: Account
        withdrawAuthority: Account
    }
    type StakeWithdrawInstruction implements TransactionInstruction {
        data: StakeWithdrawInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Deactivate
    type StakeDeactivateInstructionData {
        clockSysvar: String
        stakeAccount: Account
        stakeAuthority: Account
    }
    type StakeDeactivateInstruction implements TransactionInstruction {
        data: StakeDeactivateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: SetLockup
    type StakeSetLockupInstructionData {
        custodian: Account
        lockup: Lockup
        stakeAccount: Account
    }
    type StakeSetLockupInstruction implements TransactionInstruction {
        data: StakeSetLockupInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Merge
    type StakeMergeInstructionData {
        clockSysvar: String
        destination: Account
        source: Account
        stakeAuthority: Account
        stakeHistorySysvar: String
    }
    type StakeMergeInstruction implements TransactionInstruction {
        data: StakeMergeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: AuthorizeWithSeed
    type StakeAuthorizeWithSeedInstructionData {
        authorityBase: Account
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: String
        custodian: Account
        newAuthorized: Account
        stakeAccount: Account
    }
    type StakeAuthorizeWithSeedInstruction implements TransactionInstruction {
        data: StakeAuthorizeWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: InitializeChecked
    type StakeInitializeCheckedInstructionDataAuthorized {
        rentSysvar: String
        stakeAccount: Account
        staker: Account
        withdrawer: Account
    }
    type StakeInitializeCheckedInstruction implements TransactionInstruction {
        data: StakeInitializeCheckedInstructionDataAuthorized
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: AuthorizeChecked
    type StakeAuthorizeCheckedInstructionData {
        authority: Account
        authorityType: String
        clockSysvar: String
        custodian: Account
        newAuthority: Account
        stakeAccount: Account
    }
    type StakeAuthorizeCheckedInstruction implements TransactionInstruction {
        data: StakeAuthorizeCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: AuthorizeCheckedWithSeed
    type StakeAuthorizeCheckedWithSeedInstructionData {
        authorityBase: Account
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: String
        custodian: Account
        newAuthorized: Account
        stakeAccount: Account
    }
    type StakeAuthorizeCheckedWithSeedInstruction implements TransactionInstruction {
        data: StakeAuthorizeCheckedWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: SetLockupChecked
    type StakeSetLockupCheckedInstructionData {
        custodian: Account
        lockup: Lockup
        stakeAccount: Account
    }
    type StakeSetLockupCheckedInstruction implements TransactionInstruction {
        data: StakeSetLockupCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: DeactivateDelinquent
    type StakeDeactivateDelinquentInstructionData {
        referenceVoteAccount: Account
        stakeAccount: Account
        voteAccount: Account
    }
    type StakeDeactivateDelinquentInstruction implements TransactionInstruction {
        data: StakeDeactivateDelinquentInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Stake: Redelegate
    type StakeRedelegateInstructionData {
        newStakeAccount: Account
        stakeAccount: Account
        stakeAuthority: Account
        stakeConfigAccount: Account
        voteAccount: Account
    }
    type StakeRedelegateInstruction implements TransactionInstruction {
        data: StakeRedelegateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: CreateAccount
    type CreateAccountInstructionData {
        lamports: BigInt
        newAccount: Account
        owner: Account
        source: Account
        space: BigInt
    }
    type CreateAccountInstruction implements TransactionInstruction {
        data: CreateAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: Assign
    type AssignInstructionData {
        account: Account
        owner: Account
    }
    type AssignInstruction implements TransactionInstruction {
        data: AssignInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: Transfer
    type TransferInstructionData {
        destination: Account
        lamports: BigInt
        source: Account
    }
    type TransferInstruction implements TransactionInstruction {
        data: TransferInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: CreateAccountWithSeed
    type CreateAccountWithSeedInstructionData {
        base: Account
        lamports: BigInt
        owner: Account
        seed: String
        space: BigInt
    }
    type CreateAccountWithSeedInstruction implements TransactionInstruction {
        data: CreateAccountWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: AdvanceNonceAccount
    type AdvanceNonceAccountInstructionData {
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: String
    }
    type AdvanceNonceAccountInstruction implements TransactionInstruction {
        data: AdvanceNonceAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: WithdrawNonceAccount
    type WithdrawNonceAccountInstructionData {
        destination: Account
        lamports: BigInt
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: String
        rentSysvar: String
    }
    type WithdrawNonceAccountInstruction implements TransactionInstruction {
        data: WithdrawNonceAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: InitializeNonceAccount
    type InitializeNonceAccountInstructionData {
        nonceAccount: Account
        nonceAuthority: Account
        recentBlockhashesSysvar: String
        rentSysvar: String
    }
    type InitializeNonceAccountInstruction implements TransactionInstruction {
        data: InitializeNonceAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: AuthorizeNonceAccount
    type AuthorizeNonceAccountInstructionData {
        newAuthorized: Account
        nonceAccount: Account
        nonceAuthority: Account
    }
    type AuthorizeNonceAccountInstruction implements TransactionInstruction {
        data: AuthorizeNonceAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: UpgradeNonceAccount
    type UpgradeNonceAccountInstructionData {
        nonceAccount: Account
        nonceAuthority: Account
    }
    type UpgradeNonceAccountInstruction implements TransactionInstruction {
        data: UpgradeNonceAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: Allocate
    type AllocateInstructionData {
        account: Account
        space: BigInt
    }
    type AllocateInstruction implements TransactionInstruction {
        data: AllocateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: AllocateWithSeed
    type AllocateWithSeedInstructionData {
        account: Account
        base: String
        owner: Account
        seed: String
        space: BigInt
    }
    type AllocateWithSeedInstruction implements TransactionInstruction {
        data: AllocateWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: AssignWithSeed
    type AssignWithSeedInstructionData {
        account: Account
        base: String
        owner: Account
        seed: String
    }
    type AssignWithSeedInstruction implements TransactionInstruction {
        data: AssignWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # System: TransferWithSeed
    type TransferWithSeedInstructionData {
        destination: Account
        lamports: BigInt
        source: Account
        sourceBase: String
        sourceOwner: Account
        sourceSeed: String
    }
    type TransferWithSeedInstruction implements TransactionInstruction {
        data: TransferWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: InitializeAccount
    type VoteInitializeAccountInstructionData {
        authorizedVoter: Account
        authorizedWithdrawer: Account
        clockSysvar: String
        commission: BigInt # FIXME:*
        node: Account
        rentSysvar: String
        voteAccount: Account
    }
    type VoteInitializeAccountInstruction implements TransactionInstruction {
        data: VoteInitializeAccountInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: Authorize
    type VoteAuthorizeInstructionData {
        authority: Account
        authorityType: String
        clockSysvar: String
        newAuthority: Account
        voteAccount: Account
    }
    type VoteAuthorizeInstruction implements TransactionInstruction {
        data: VoteAuthorizeInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: AuthorizeWithSeed
    type VoteAuthorizeWithSeedInstructionData {
        authorityBaseKey: String
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: String
        newAuthority: Account
        voteAccount: Account
    }
    type VoteAuthorizeWithSeedInstruction implements TransactionInstruction {
        data: VoteAuthorizeWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: AuthorizeCheckedWithSeed
    type VoteAuthorizeCheckedWithSeedInstructionData {
        authorityBaseKey: String
        authorityOwner: Account
        authoritySeed: String
        authorityType: String
        clockSysvar: String
        newAuthority: Account
        voteAccount: Account
    }
    type VoteAuthorizeCheckedWithSeedInstruction implements TransactionInstruction {
        data: VoteAuthorizeCheckedWithSeedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    type Vote {
        hash: String
        slots: [BigInt]
        timestamp: BigInt
    }

    # Vote: Vote
    type VoteVoteInstructionData {
        clockSysvar: String
        slotHashesSysvar: String
        vote: Vote
        voteAccount: Account
        voteAuthority: Account
    }
    type VoteVoteInstruction implements TransactionInstruction {
        data: VoteVoteInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
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

    # Vote: UpdateVoteState
    type VoteUpdateVoteStateInstructionData {
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }
    type VoteUpdateVoteStateInstruction implements TransactionInstruction {
        data: VoteUpdateVoteStateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: UpdateVoteStateSwitch
    type VoteUpdateVoteStateSwitchInstructionData {
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }
    type VoteUpdateVoteStateSwitchInstruction implements TransactionInstruction {
        data: VoteUpdateVoteStateSwitchInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: CompactUpdateVoteState
    type VoteCompactUpdateVoteStateInstructionData {
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }
    type VoteCompactUpdateVoteStateInstruction implements TransactionInstruction {
        data: VoteCompactUpdateVoteStateInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: CompactUpdateVoteStateSwitch
    type VoteCompactUpdateVoteStateSwitchInstructionData {
        hash: String
        voteAccount: Account
        voteAuthority: Account
        voteStateUpdate: VoteStateUpdate
    }
    type VoteCompactUpdateVoteStateSwitchInstruction implements TransactionInstruction {
        data: VoteCompactUpdateVoteStateSwitchInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: Withdraw
    type VoteWithdrawInstructionData {
        destination: Account
        lamports: BigInt
        voteAccount: Account
        withdrawAuthority: Account
    }
    type VoteWithdrawInstruction implements TransactionInstruction {
        data: VoteWithdrawInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: UpdateValidatorIdentity
    type VoteUpdateValidatorIdentityInstructionData {
        newValidatorIdentity: Account
        voteAccount: Account
        withdrawAuthority: Account
    }
    type VoteUpdateValidatorIdentityInstruction implements TransactionInstruction {
        data: VoteUpdateValidatorIdentityInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: UpdateCommission
    type VoteUpdateCommissionInstructionData {
        commission: BigInt # FIXME:*
        voteAccount: Account
        withdrawAuthority: Account
    }
    type VoteUpdateCommissionInstruction implements TransactionInstruction {
        data: VoteUpdateCommissionInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: VoteSwitch
    type VoteVoteSwitchInstructionData {
        clockSysvar: String
        hash: String
        slotHashesSysvar: String
        vote: Vote
        voteAccount: Account
        voteAuthority: Account
    }
    type VoteVoteSwitchInstruction implements TransactionInstruction {
        data: VoteVoteSwitchInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }

    # Vote: AuthorizeChecked
    type VoteAuthorizeCheckedInstructionData {
        authority: Account
        authorityType: String
        clockSysvar: String
        newAuthority: Account
        voteAccount: Account
    }
    type VoteAuthorizeCheckedInstruction implements TransactionInstruction {
        data: VoteAuthorizeCheckedInstructionData
        meta: JsonParsedInstructionMeta
        programId: String
    }
`;

export const instructionResolvers = {
    TransactionInstruction: {
        __resolveType(instruction: { meta: { program: string; type: string } }) {
            if (instruction.meta) {
                if (instruction.meta.program === 'address-lookup-table') {
                    if (instruction.meta.type === 'createLookupTable') {
                        return 'CreateLookupTableInstruction';
                    }
                    if (instruction.meta.type === 'freezeLookupTable') {
                        return 'FreezeLookupTableInstruction';
                    }
                    if (instruction.meta.type === 'extendLookupTable') {
                        return 'ExtendLookupTableInstruction';
                    }
                    if (instruction.meta.type === 'deactivateLookupTable') {
                        return 'DeactivateLookupTableInstruction';
                    }
                    if (instruction.meta.type === 'closeLookupTable') {
                        return 'CloseLookupTableInstruction';
                    }
                }
                if (instruction.meta.program === 'bpf-loader') {
                    if (instruction.meta.type === 'write') {
                        return 'BpfLoaderWriteInstruction';
                    }
                    if (instruction.meta.type === 'finalize') {
                        return 'BpfLoaderFinalizeInstruction';
                    }
                }
                if (instruction.meta.program === 'bpf-upgradeable-loader') {
                    if (instruction.meta.type === 'initializeBuffer') {
                        return 'BpfUpgradeableLoaderInitializeBufferInstruction';
                    }
                    if (instruction.meta.type === 'write') {
                        return 'BpfUpgradeableLoaderWriteInstruction';
                    }
                    if (instruction.meta.type === 'deployWithMaxDataLen') {
                        return 'BpfUpgradeableLoaderDeployWithMaxDataLenInstruction';
                    }
                    if (instruction.meta.type === 'upgrade') {
                        return 'BpfUpgradeableLoaderUpgradeInstruction';
                    }
                    if (instruction.meta.type === 'setAuthority') {
                        return 'BpfUpgradeableLoaderSetAuthorityInstruction';
                    }
                    if (instruction.meta.type === 'setAuthorityChecked') {
                        return 'BpfUpgradeableLoaderSetAuthorityCheckedInstruction';
                    }
                    if (instruction.meta.type === 'close') {
                        return 'BpfUpgradeableLoaderCloseInstruction';
                    }
                    if (instruction.meta.type === 'extendProgram') {
                        return 'BpfUpgradeableLoaderExtendProgramInstruction';
                    }
                }
                if (instruction.meta.program === 'spl-associated-token-account') {
                    if (instruction.meta.type === 'create') {
                        return 'SplAssociatedTokenCreateInstruction';
                    }
                    if (instruction.meta.type === 'createIdempotent') {
                        return 'SplAssociatedTokenCreateIdempotentInstruction';
                    }
                    if (instruction.meta.type === 'recoverNested') {
                        return 'SplAssociatedTokenRecoverNestedInstruction';
                    }
                }
                if (instruction.meta.program === 'spl-memo') {
                    return 'SplMemoInstruction';
                }
                if (instruction.meta.program === 'spl-token') {
                    if (instruction.meta.type === 'initializeMint') {
                        return 'SplTokenInitializeMintInstruction';
                    }
                    if (instruction.meta.type === 'initializeMint2') {
                        return 'SplTokenInitializeMint2Instruction';
                    }
                    if (instruction.meta.type === 'initializeAccount') {
                        return 'SplTokenInitializeAccountInstruction';
                    }
                    if (instruction.meta.type === 'initializeAccount2') {
                        return 'SplTokenInitializeAccount2Instruction';
                    }
                    if (instruction.meta.type === 'initializeAccount3') {
                        return 'SplTokenInitializeAccount3Instruction';
                    }
                    if (instruction.meta.type === 'initializeMultisig') {
                        return 'SplTokenInitializeMultisigInstruction';
                    }
                    if (instruction.meta.type === 'initializeMultisig2') {
                        return 'SplTokenInitializeMultisig2Instruction';
                    }
                    if (instruction.meta.type === 'transfer') {
                        return 'SplTokenTransferInstruction';
                    }
                    if (instruction.meta.type === 'approve') {
                        return 'SplTokenApproveInstruction';
                    }
                    if (instruction.meta.type === 'revoke') {
                        return 'SplTokenRevokeInstruction';
                    }
                    if (instruction.meta.type === 'setAuthority') {
                        return 'SplTokenSetAuthorityInstruction';
                    }
                    if (instruction.meta.type === 'mintTo') {
                        return 'SplTokenMintToInstruction';
                    }
                    if (instruction.meta.type === 'burn') {
                        return 'SplTokenBurnInstruction';
                    }
                    if (instruction.meta.type === 'closeAccount') {
                        return 'SplTokenCloseAccountInstruction';
                    }
                    if (instruction.meta.type === 'freezeAccount') {
                        return 'SplTokenFreezeAccountInstruction';
                    }
                    if (instruction.meta.type === 'thawAccount') {
                        return 'SplTokenThawAccountInstruction';
                    }
                    if (instruction.meta.type === 'transferChecked') {
                        return 'SplTokenTransferCheckedInstruction';
                    }
                    if (instruction.meta.type === 'approveChecked') {
                        return 'SplTokenApproveCheckedInstruction';
                    }
                    if (instruction.meta.type === 'mintToChecked') {
                        return 'SplTokenMintToCheckedInstruction';
                    }
                    if (instruction.meta.type === 'burnChecked') {
                        return 'SplTokenBurnCheckedInstruction';
                    }
                    if (instruction.meta.type === 'syncNative') {
                        return 'SplTokenSyncNativeInstruction';
                    }
                    if (instruction.meta.type === 'getAccountDataSize') {
                        return 'SplTokenGetAccountDataSizeInstruction';
                    }
                    if (instruction.meta.type === 'initializeImmutableOwner') {
                        return 'SplTokenInitializeImmutableOwnerInstruction';
                    }
                    if (instruction.meta.type === 'amountToUiAmount') {
                        return 'SplTokenAmountToUiAmountInstruction';
                    }
                    if (instruction.meta.type === 'uiAmountToAmount') {
                        return 'SplTokenUiAmountToAmountInstruction';
                    }
                    if (instruction.meta.type === 'initializeMintCloseAuthority') {
                        return 'SplTokenInitializeMintCloseAuthorityInstruction';
                    }
                }
                if (instruction.meta.program === 'stake') {
                    if (instruction.meta.type === 'initialize') {
                        return 'StakeInitializeInstruction';
                    }
                    if (instruction.meta.type === 'authorize') {
                        return 'StakeAuthorizeInstruction';
                    }
                    if (instruction.meta.type === 'delegate') {
                        return 'StakeDelegateStakeInstruction';
                    }
                    if (instruction.meta.type === 'split') {
                        return 'StakeSplitInstruction';
                    }
                    if (instruction.meta.type === 'withdraw') {
                        return 'StakeWithdrawInstruction';
                    }
                    if (instruction.meta.type === 'deactivate') {
                        return 'StakeDeactivateInstruction';
                    }
                    if (instruction.meta.type === 'setLockup') {
                        return 'StakeSetLockupInstruction';
                    }
                    if (instruction.meta.type === 'merge') {
                        return 'StakeMergeInstruction';
                    }
                    if (instruction.meta.type === 'authorizeWithSeed') {
                        return 'StakeAuthorizeWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'initializeChecked') {
                        return 'StakeInitializeCheckedInstruction';
                    }
                    if (instruction.meta.type === 'authorizeChecked') {
                        return 'StakeAuthorizeCheckedInstruction';
                    }
                    if (instruction.meta.type === 'authorizeCheckedWithSeed') {
                        return 'StakeAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'setLockupChecked') {
                        return 'StakeSetLockupCheckedInstruction';
                    }
                    if (instruction.meta.type === 'deactivateDelinquent') {
                        return 'StakeDeactivateDelinquentInstruction';
                    }
                    if (instruction.meta.type === 'redelegate') {
                        return 'StakeRedelegateInstruction';
                    }
                }
                if (instruction.meta.program === 'system') {
                    if (instruction.meta.type === 'createAccount') {
                        return 'CreateAccountInstruction';
                    }
                    if (instruction.meta.type === 'assign') {
                        return 'AssignInstruction';
                    }
                    if (instruction.meta.type === 'transfer') {
                        return 'TransferInstruction';
                    }
                    if (instruction.meta.type === 'createAccountWithSeed') {
                        return 'CreateAccountWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'advanceNonceAccount') {
                        return 'AdvanceNonceAccountInstruction';
                    }
                    if (instruction.meta.type === 'withdrawNonceAccount') {
                        return 'WithdrawNonceAccountInstruction';
                    }
                    if (instruction.meta.type === 'initializeNonceAccount') {
                        return 'InitializeNonceAccountInstruction';
                    }
                    if (instruction.meta.type === 'authorizeNonceAccount') {
                        return 'AuthorizeNonceAccountInstruction';
                    }
                    if (instruction.meta.type === 'upgradeNonceAccount') {
                        return 'UpgradeNonceAccountInstruction';
                    }
                    if (instruction.meta.type === 'allocate') {
                        return 'AllocateInstruction';
                    }
                    if (instruction.meta.type === 'allocateWithSeed') {
                        return 'AllocateWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'assignWithSeed') {
                        return 'AssignWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'transferWithSeed') {
                        return 'TransferWithSeedInstruction';
                    }
                }
                if (instruction.meta.program === 'vote') {
                    if (instruction.meta.type === 'initialize') {
                        return 'VoteInitializeAccountInstruction';
                    }
                    if (instruction.meta.type === 'authorize') {
                        return 'VoteAuthorizeInstruction';
                    }
                    if (instruction.meta.type === 'authorizeWithSeed') {
                        return 'VoteAuthorizeWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'authorizeCheckedWithSeed') {
                        return 'VoteAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.meta.type === 'vote') {
                        return 'VoteVoteInstruction';
                    }
                    if (instruction.meta.type === 'updatevotestate') {
                        return 'VoteUpdateVoteStateInstruction';
                    }
                    if (instruction.meta.type === 'updatevotestateswitch') {
                        return 'VoteUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.meta.type === 'compactupdatevotestate') {
                        return 'VoteCompactUpdateVoteStateInstruction';
                    }
                    if (instruction.meta.type === 'compactupdatevotestateswitch') {
                        return 'VoteCompactUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.meta.type === 'withdraw') {
                        return 'VoteWithdrawInstruction';
                    }
                    if (instruction.meta.type === 'updateValidatorIdentity') {
                        return 'VoteUpdateValidatorIdentityInstruction';
                    }
                    if (instruction.meta.type === 'updateCommission') {
                        return 'VoteUpdateCommissionInstruction';
                    }
                    if (instruction.meta.type === 'voteSwitch') {
                        return 'VoteVoteSwitchInstruction';
                    }
                    if (instruction.meta.type === 'authorizeChecked') {
                        return 'VoteAuthorizeCheckedInstruction';
                    }
                }
            }
            return 'GenericInstruction';
        },
    },
    CreateLookupTableInstructionData: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        payerAccount: resolveAccount('payerAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    ExtendLookupTableInstructionData: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        payerAccount: resolveAccount('payerAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    FreezeLookupTableInstructionData: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
    },
    DeactivateLookupTableInstructionData: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
    },
    CloseLookupTableInstructionData: {
        lookupTableAccount: resolveAccount('lookupTableAccount'),
        lookupTableAuthority: resolveAccount('lookupTableAuthority'),
        recipient: resolveAccount('recipient'),
    },
    BpfLoaderWriteInstructionData: {
        account: resolveAccount('account'),
    },
    BpfLoaderFinalizeInstructionData: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderInitializeBufferInstructionData: {
        account: resolveAccount('account'),
    },
    BpfUpgradeableLoaderWriteInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
    },
    BpfUpgradeableLoaderDeployWithMaxDataLenInstructionData: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderUpgradeInstructionData: {
        authority: resolveAccount('authority'),
        bufferAccount: resolveAccount('bufferAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
    },
    BpfUpgradeableLoaderSetAuthorityInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderSetAuthorityCheckedInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    BpfUpgradeableLoaderCloseInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        programAccount: resolveAccount('programAccount'),
        recipient: resolveAccount('recipient'),
    },
    BpfUpgradeableLoaderExtendProgramInstructionData: {
        payerAccount: resolveAccount('payerAccount'),
        programAccount: resolveAccount('programAccount'),
        programDataAccount: resolveAccount('programDataAccount'),
        systemProgram: resolveAccount('systemProgram'),
    },
    SplAssociatedTokenCreateInstructionData: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        source: resolveAccount('source'),
        systemProgram: resolveAccount('systemProgram'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplAssociatedTokenCreateIdempotentInstructionData: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        source: resolveAccount('source'),
        systemProgram: resolveAccount('systemProgram'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplAssociatedTokenRecoverNestedInstructionData: {
        destination: resolveAccount('destination'),
        nestedMint: resolveAccount('nestedMint'),
        nestedOwner: resolveAccount('nestedOwner'),
        nestedSource: resolveAccount('nestedSource'),
        ownerMint: resolveAccount('ownerMint'),
        tokenProgram: resolveAccount('tokenProgram'),
        wallet: resolveAccount('wallet'),
    },
    SplTokenInitializeMintInstructionData: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeMint2InstructionData: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    SplTokenInitializeAccountInstructionData: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeAccount2InstructionData: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeAccount3InstructionData: {
        account: resolveAccount('account'),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    SplTokenInitializeMultisigInstructionData: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenInitializeMultisig2InstructionData: {
        multisig: resolveAccount('multisig'),
    },
    SplTokenTransferInstructionData: {
        authority: resolveAccount('authority'),
        destination: resolveAccount('destination'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        source: resolveAccount('source'),
    },
    SplTokenApproveInstructionData: {
        delegate: resolveAccount('delegate'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenRevokeInstructionData: {
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenSetAuthorityInstructionData: {
        authority: resolveAccount('authority'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        newAuthority: resolveAccount('newAuthority'),
    },
    SplTokenMintToInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
    },
    SplTokenBurnInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenCloseAccountInstructionData: {
        account: resolveAccount('account'),
        destination: resolveAccount('destination'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
    },
    SplTokenFreezeAccountInstructionData: {
        account: resolveAccount('account'),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        multisigFreezeAuthority: resolveAccount('multisigFreezeAuthority'),
    },
    SplTokenThawAccountInstructionData: {
        account: resolveAccount('account'),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mint: resolveAccount('mint'),
        multisigFreezeAuthority: resolveAccount('multisigFreezeAuthority'),
    },
    SplTokenTransferCheckedInstructionData: {
        authority: resolveAccount('authority'),
        destination: resolveAccount('destination'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
        source: resolveAccount('source'),
    },
    SplTokenApproveCheckedInstructionData: {
        delegate: resolveAccount('delegate'),
        mint: resolveAccount('mint'),
        multisigOwner: resolveAccount('multisigOwner'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    SplTokenMintToCheckedInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        mintAuthority: resolveAccount('mintAuthority'),
        multisigMintAuthority: resolveAccount('multisigMintAuthority'),
    },
    SplTokenBurnCheckedInstructionData: {
        account: resolveAccount('account'),
        authority: resolveAccount('authority'),
        mint: resolveAccount('mint'),
        multisigAuthority: resolveAccount('multisigAuthority'),
    },
    SplTokenSyncNativeInstructionData: {
        account: resolveAccount('account'),
    },
    SplTokenGetAccountDataSizeInstructionData: {
        mint: resolveAccount('mint'),
    },
    SplTokenAmountToUiAmountInstructionData: {
        mint: resolveAccount('mint'),
    },
    SplTokenUiAmountToAmountInstructionData: {
        mint: resolveAccount('mint'),
    },
    SplTokenInitializeMintCloseAuthorityInstructionData: {
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
    StakeInitializeInstructionData: {
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeInstructionData: {
        authority: resolveAccount('authority'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeDelegateStakeInstructionData: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeSplitInstructionData: {
        newSplitAccount: resolveAccount('newSplitAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeWithdrawInstructionData: {
        destination: resolveAccount('destination'),
        stakeAccount: resolveAccount('stakeAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    StakeDeactivateInstructionData: {
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeSetLockupInstructionData: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeMergeInstructionData: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        stakeAuthority: resolveAccount('stakeAuthority'),
    },
    StakeAuthorizeWithSeedInstructionData: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeInitializeCheckedInstructionDataAuthorized: {
        stakeAccount: resolveAccount('stakeAccount'),
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeAuthorizeCheckedInstructionData: {
        authority: resolveAccount('authority'),
        custodian: resolveAccount('custodian'),
        newAuthority: resolveAccount('newAuthority'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeAuthorizeCheckedWithSeedInstructionData: {
        authorityBase: resolveAccount('authorityBase'),
        authorityOwner: resolveAccount('authorityOwner'),
        custodian: resolveAccount('custodian'),
        newAuthorized: resolveAccount('newAuthorized'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeSetLockupCheckedInstructionData: {
        custodian: resolveAccount('custodian'),
        stakeAccount: resolveAccount('stakeAccount'),
    },
    StakeDeactivateDelinquentInstructionData: {
        referenceVoteAccount: resolveAccount('referenceVoteAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    StakeRedelegateInstructionData: {
        newStakeAccount: resolveAccount('newStakeAccount'),
        stakeAccount: resolveAccount('stakeAccount'),
        stakeAuthority: resolveAccount('stakeAuthority'),
        stakeConfigAccount: resolveAccount('stakeConfigAccount'),
        voteAccount: resolveAccount('voteAccount'),
    },
    CreateAccountInstructionData: {
        newAccount: resolveAccount('newAccount'),
        owner: resolveAccount('owner'),
        source: resolveAccount('source'),
    },
    AssignInstructionData: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    TransferInstructionData: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
    },
    CreateAccountWithSeedInstructionData: {
        base: resolveAccount('base'),
        owner: resolveAccount('owner'),
        seed: resolveAccount('seed'),
    },
    AdvanceNonceAccountInstructionData: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    WithdrawNonceAccountInstructionData: {
        destination: resolveAccount('destination'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    InitializeNonceAccountInstructionData: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    AuthorizeNonceAccountInstructionData: {
        newAuthorized: resolveAccount('newAuthorized'),
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    UpgradeNonceAccountInstructionData: {
        nonceAccount: resolveAccount('nonceAccount'),
        nonceAuthority: resolveAccount('nonceAuthority'),
    },
    AllocateInstructionData: {
        account: resolveAccount('account'),
    },
    AllocateWithSeedInstructionData: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    AssignWithSeedInstructionData: {
        account: resolveAccount('account'),
        owner: resolveAccount('owner'),
    },
    TransferWithSeedInstructionData: {
        destination: resolveAccount('destination'),
        source: resolveAccount('source'),
        sourceOwner: resolveAccount('sourceOwner'),
    },
    VoteInitializeAccountInstructionData: {
        authorizedVoter: resolveAccount('authorizedVoter'),
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('node'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeInstructionData: {
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeWithSeedInstructionData: {
        authorityOwner: resolveAccount('authorityOwner'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteAuthorizeCheckedWithSeedInstructionData: {
        authorityOwner: resolveAccount('authorityOwner'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
    VoteVoteInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteUpdateVoteStateInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteUpdateVoteStateSwitchInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteCompactUpdateVoteStateInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteCompactUpdateVoteStateSwitchInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteWithdrawInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateValidatorIdentityInstructionData: {
        newValidatorIdentity: resolveAccount('newValidatorIdentity'),
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteUpdateCommissionInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        withdrawAuthority: resolveAccount('withdrawAuthority'),
    },
    VoteVoteSwitchInstructionData: {
        voteAccount: resolveAccount('voteAccount'),
        voteAuthority: resolveAccount('voteAuthority'),
    },
    VoteAuthorizeCheckedInstructionData: {
        authority: resolveAccount('authority'),
        newAuthority: resolveAccount('newAuthority'),
        voteAccount: resolveAccount('voteAccount'),
    },
};
