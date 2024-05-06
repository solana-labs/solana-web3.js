export const accountTypeDefs = /* GraphQL */ `
    """
    Token-2022 Extensions (Account State)
    """
    interface SplTokenExtension {
        extension: String
    }

    """
    Token-2022 Extension: Confidential Transfer Fee Config
    """
    type SplTokenExtensionConfidentialTransferFeeConfig implements SplTokenExtension {
        extension: String
        authority: Account
        harvestToMintEnabled: Boolean
        withdrawWithheldAuthorityElgamalPubkey: Address
        withheldAmount: String
    }

    """
    Token-2022 Extension: Confidential Transfer Mint
    """
    type SplTokenExtensionConfidentialTransferMint implements SplTokenExtension {
        extension: String
        auditorElgamalPubkey: Address
        authority: Account
        autoApproveNewAccounts: Boolean
    }

    """
    Token-2022 Extension: Default Account State
    """
    type SplTokenExtensionDefaultAccountState implements SplTokenExtension {
        extension: String
        accountState: SplTokenDefaultAccountState
    }

    """
    Token-2022 Extension: Group Pointer
    """
    type SplTokenExtensionGroupPointer implements SplTokenExtension {
        extension: String
        authority: Account
        groupAddress: Account
    }

    """
    Token-2022 Extension: Group Member Pointer
    """
    type SplTokenExtensionGroupMemberPointer implements SplTokenExtension {
        extension: String
        authority: Account
        memberAddress: Account
    }

    """
    Token-2022 Extension: Interest-Bearing Config
    """
    type SplTokenExtensionInterestBearingConfig implements SplTokenExtension {
        extension: String
        currentRate: Int
        initializationTimestamp: BigInt
        lastUpdateTimestamp: BigInt
        preUpdateAverageRate: Int
        rateAuthority: Account
    }

    """
    Token-2022 Extension: Metadata Pointer
    """
    type SplTokenExtensionMetadataPointer implements SplTokenExtension {
        extension: String
        authority: Account
        metadataAddress: Account
    }

    """
    Token-2022 Extension: Mint Close Authority
    """
    type SplTokenExtensionMintCloseAuthority implements SplTokenExtension {
        extension: String
        closeAuthority: Account
    }

    """
    Token-2022 Extension: Non-Transferable
    """
    type SplTokenExtensionNonTransferable implements SplTokenExtension {
        extension: String
    }

    """
    Token-2022 Extension: Permanent Delegate
    """
    type SplTokenExtensionPermanentDelegate implements SplTokenExtension {
        extension: String
        delegate: Account
    }

    """
    Token-2022 Extension: Token Group
    """
    type SplTokenExtensionTokenGroup implements SplTokenExtension {
        extension: String
        maxSize: BigInt
        mint: Account
        size: BigInt
        updateAuthority: Account
    }

    """
    Token-2022 Extension: Token Group Member
    """
    type SplTokenExtensionTokenGroupMember implements SplTokenExtension {
        extension: String
        group: Account
        memberNumber: BigInt
        mint: Account
    }

    type SplTokenMetadataAdditionalMetadata {
        key: String
        value: String
    }
    """
    Token-2022 Extension: Token Metadata
    """
    type SplTokenExtensionTokenMetadata implements SplTokenExtension {
        extension: String
        additionalMetadata: [SplTokenMetadataAdditionalMetadata]
        mint: Account
        name: String
        symbol: String
        updateAuthority: Account
        uri: String
    }

    type SplTokenTransferFeeConfig {
        epoch: Epoch
        maximumFee: BigInt
        transferFeeBasisPoints: Int
    }
    """
    Token-2022 Extension: Transfer Fee Config
    """
    type SplTokenExtensionTransferFeeConfig implements SplTokenExtension {
        extension: String
        newerTransferFee: SplTokenTransferFeeConfig
        olderTransferFee: SplTokenTransferFeeConfig
        transferFeeConfigAuthority: Account
        withdrawWithheldAuthority: Account
        withheldAmount: BigInt
    }

    """
    Token-2022 Extension: Transfer Hook
    """
    type SplTokenExtensionTransferHook implements SplTokenExtension {
        extension: String
        authority: Account
        hookProgramId: Account
    }

    """
    Token-2022 Extension: Transfer Fee Amount
    """
    type SplTokenExtensionTransferFeeAmount implements SplTokenExtension {
        extension: String
        withheldAmount: BigInt
    }

    """
    Token-2022 Extension: Transfer Hook Account
    """
    type SplTokenExtensionTransferHookAccount implements SplTokenExtension {
        extension: String
        transferring: Boolean
    }

    """
    Token-2022 Extension: Confidential Transfer Fee Amount
    """
    type SplTokenExtensionConfidentialTransferFeeAmount implements SplTokenExtension {
        extension: String
        withheldAmount: String
    }

    """
    Token-2022 Extension: NonTransferableAccount
    """
    type SplTokenExtensionNonTransferableAccount implements SplTokenExtension {
        extension: String
    }

    """
    Token-2022 Extension: ImmutableOwner
    """
    type SplTokenExtensionImmutableOwner implements SplTokenExtension {
        extension: String
    }

    """
    Token-2022 Extension: MemoTransfer
    """
    type SplTokenExtensionMemoTransfer implements SplTokenExtension {
        extension: String
        requireIncomingTransferMemos: Boolean
    }

    """
    Token-2022 Extension: CpiGuard
    """
    type SplTokenExtensionCpiGuard implements SplTokenExtension {
        extension: String
        lockCpi: Boolean
    }

    """
    Token-2022 Extension: ConfidentialTransferAccount
    """
    type SplTokenExtensionConfidentialTransferAccount implements SplTokenExtension {
        extension: String
        actualPendingBalanceCreditCounter: Int
        allowConfidentialCredits: Boolean
        allowNonConfidentialCredits: Boolean
        approved: Boolean
        availableBalance: String
        decryptableAvailableBalance: String
        elgamalPubkey: String
        expectedPendingBalanceCreditCounter: Int
        maximumPendingBalanceCreditCounter: Int
        pendingBalanceCreditCounter: Int
        pendingBalanceHi: String
        pendingBalanceLo: String
    }

    """
    Account interface
    """
    interface Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
    }

    """
    Generic base account type
    """
    type GenericAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
    }

    type NonceAccountFeeCalculator {
        lamportsPerSignature: Lamports
    }
    """
    A nonce account
    """
    type NonceAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        authority: Account
        blockhash: Hash
        feeCalculator: NonceAccountFeeCalculator
    }

    """
    A lookup table account
    """
    type LookupTableAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        addresses: [Address]
        authority: Account
        deactivationSlot: Slot
        lastExtendedSlot: Slot
        lastExtendedSlotStartIndex: Int
    }

    """
    A mint account
    """
    type MintAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        decimals: Int
        extensions: [SplTokenExtension]
        freezeAuthority: Account
        isInitialized: Boolean
        mintAuthority: Account
        supply: BigInt
    }

    """
    A token account
    """
    type TokenAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        extensions: [SplTokenExtension]
        isNative: Boolean
        mint: Account
        owner: Account
        state: String
        tokenAmount: TokenAmount
    }

    type StakeAccountDataMetaAuthorized {
        staker: Account
        withdrawer: Account
    }
    type StakeAccountDataMetaLockup {
        custodian: Account
        epoch: Epoch
        unixTimestamp: BigInt
    }
    type StakeAccountDataMeta {
        authorized: StakeAccountDataMetaAuthorized
        lockup: StakeAccountDataMetaLockup
        rentExemptReserve: Lamports
    }
    type StakeAccountDataStakeDelegation {
        activationEpoch: Epoch
        deactivationEpoch: Epoch
        stake: Lamports
        voter: Account
        warmupCooldownRate: Int
    }
    type StakeAccountDataStake {
        creditsObserved: BigInt
        delegation: StakeAccountDataStakeDelegation
    }
    """
    A stake account
    """
    type StakeAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        meta: StakeAccountDataMeta
        stake: StakeAccountDataStake
    }

    type VoteAccountDataAuthorizedVoter {
        authorizedVoter: Account
        epoch: Epoch
    }
    type VoteAccountDataEpochCredit {
        credits: BigInt
        epoch: Epoch
        previousCredits: BigInt
    }
    type VoteAccountDataLastTimestamp {
        slot: Slot
        timestamp: BigInt
    }
    type VoteAccountDataVote {
        confirmationCount: Int
        slot: Slot
    }
    """
    A vote account
    """
    type VoteAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        authorizedVoters: [VoteAccountDataAuthorizedVoter]
        authorizedWithdrawer: Account
        commission: Int
        epochCredits: [VoteAccountDataEpochCredit]
        lastTimestamp: VoteAccountDataLastTimestamp
        node: Account
        priorVoters: [Address]
        rootSlot: Slot
        votes: [VoteAccountDataVote]
    }

    """
    Sysvar Clock
    """
    type SysvarClockAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        epoch: Epoch
        epochStartTimestamp: BigInt
        leaderScheduleEpoch: Epoch
        slot: Slot
        unixTimestamp: BigInt
    }

    """
    Sysvar Epoch Rewards
    """
    type SysvarEpochRewardsAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        distributedRewards: Lamports
        distributionCompleteBlockHeight: BigInt
        totalRewards: Lamports
    }

    """
    Sysvar Epoch Schedule
    """
    type SysvarEpochScheduleAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        firstNormalEpoch: Epoch
        firstNormalSlot: Slot
        leaderScheduleSlotOffset: BigInt
        slotsPerEpoch: BigInt
        warmup: Boolean
    }

    type FeeCalculator {
        lamportsPerSignature: Lamports
    }

    """
    Sysvar Fees
    """
    type SysvarFeesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        feeCalculator: FeeCalculator
    }

    """
    Sysvar Last Restart Slot
    """
    type SysvarLastRestartSlotAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        lastRestartSlot: Slot
    }

    type SysvarRecentBlockhashesEntry {
        blockhash: Hash
        feeCalculator: FeeCalculator
    }
    """
    Sysvar Recent Blockhashes
    """
    type SysvarRecentBlockhashesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        entries: [SysvarRecentBlockhashesEntry]
    }

    """
    Sysvar Rent
    """
    type SysvarRentAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        burnPercent: Int
        exemptionThreshold: Int
        lamportsPerByteYear: Lamports
    }

    type SlotHashEntry {
        hash: Hash
        slot: Slot
    }

    """
    Sysvar Slot Hashes
    """
    type SysvarSlotHashesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        entries: [SlotHashEntry]
    }

    """
    Sysvar Slot History
    """
    type SysvarSlotHistoryAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        bits: String
        nextSlot: Slot
    }

    type StakeHistoryEntry {
        activating: Lamports
        deactivating: Lamports
        effective: Lamports
    }

    """
    Sysvar Stake History
    """
    type SysvarStakeHistoryAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: Lamports
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        entries: [StakeHistoryEntry]
    }
`;
