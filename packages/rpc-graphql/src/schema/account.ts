export const accountTypeDefs = /* GraphQL */ `
    """
    Token-2022 Extensions (Account State)
    """
    interface SplToken2022Extension {
        extension: String
    }

    """
    Token-2022 Extension: Mint Close Authority
    """
    type SplToken2022ExtensionMintCloseAuthority implements SplToken2022Extension {
        extension: String
        closeAuthority: Account
    }

    """
    Token-2022 Extension: Permanent Delegate
    """
    type SplToken2022ExtensionPermanentDelegate implements SplToken2022Extension {
        extension: String
        delegate: Account
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
        extensions: [SplToken2022Extension]
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
        extensions: [SplToken2022Extension]
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
