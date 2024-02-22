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
        rentEpoch: BigInt
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
        rentEpoch: BigInt
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
        rentEpoch: BigInt
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
        rentEpoch: BigInt
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
        rentEpoch: BigInt
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
        rentEpoch: BigInt
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
        epoch: BigInt
        unixTimestamp: BigInt
    }
    type StakeAccountDataMeta {
        authorized: StakeAccountDataMetaAuthorized
        lockup: StakeAccountDataMetaLockup
        rentExemptReserve: String
    }
    type StakeAccountDataStakeDelegation {
        activationEpoch: BigInt
        deactivationEpoch: BigInt
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
        rentEpoch: BigInt
        meta: StakeAccountDataMeta
        stake: StakeAccountDataStake
    }

    type VoteAccountDataAuthorizedVoter {
        authorizedVoter: Account
        epoch: BigInt
    }
    type VoteAccountDataEpochCredit {
        credits: String
        epoch: BigInt
        previousCredits: String
    }
    type VoteAccountDataLastTimestamp {
        slot: BigInt
        timestamp: BigInt
    }
    type VoteAccountDataVote {
        confirmationCount: Int
        slot: BigInt
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
        rentEpoch: BigInt
        authorizedVoters: [VoteAccountDataAuthorizedVoter]
        authorizedWithdrawer: Account
        commission: Int
        epochCredits: [VoteAccountDataEpochCredit]
        lastTimestamp: VoteAccountDataLastTimestamp
        node: Account
        priorVoters: [Address]
        rootSlot: BigInt
        votes: [VoteAccountDataVote]
    }
`;
