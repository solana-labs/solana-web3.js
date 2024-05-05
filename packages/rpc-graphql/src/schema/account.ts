export const accountTypeDefs = /* GraphQL */ `
    """
    Account interface
    """
    interface Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
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
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
    }

    type NonceAccountFeeCalculator {
        lamportsPerSignature: String
    }
    """
    A nonce account
    """
    type NonceAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        authority: Account
        blockhash: String
        feeCalculator: NonceAccountFeeCalculator
    }

    """
    A lookup table account
    """
    type LookupTableAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        addresses: [Address]
        authority: Account
        deactivationSlot: String
        lastExtendedSlot: String
        lastExtendedSlotStartIndex: Int
    }

    """
    A mint account
    """
    type MintAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        decimals: Int
        freezeAuthority: Account
        isInitialized: Boolean
        mintAuthority: Account
        supply: String
    }

    """
    A token account
    """
    type TokenAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
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
        rentExemptReserve: String
    }
    type StakeAccountDataStakeDelegation {
        activationEpoch: Epoch
        deactivationEpoch: Epoch
        stake: String
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
        lamports: BigInt
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
        credits: String
        epoch: Epoch
        previousCredits: String
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
        lamports: BigInt
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
        lamports: BigInt
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
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        distributedRewards: BigInt
        distributionCompleteBlockHeight: BigInt
        totalRewards: BigInt
    }

    """
    Sysvar Epoch Schedule
    """
    type SysvarEpochScheduleAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
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
        lamportsPerSignature: BigInt
    }

    """
    Sysvar Fees
    """
    type SysvarFeesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
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
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        lastRestartSlot: Slot
    }

    type SysvarRecentBlockhashesEntry {
        blockhash: String
        feeCalculator: FeeCalculator
    }
    """
    Sysvar Recent Blockhashes
    """
    type SysvarRecentBlockhashesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
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
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        burnPercent: Int
        exemptionThreshold: Int
        lamportsPerByteYear: BigInt
    }

    type SlotHashEntry {
        hash: String
        slot: Slot
    }

    """
    Sysvar Slot Hashes
    """
    type SysvarSlotHashesAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
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
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        bits: String
        nextSlot: Slot
    }

    type StakeHistoryEntry {
        activating: BigInt
        deactivating: BigInt
        effective: BigInt
    }

    """
    Sysvar Stake History
    """
    type SysvarStakeHistoryAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: Epoch
        entries: [StakeHistoryEntry]
    }
`;
