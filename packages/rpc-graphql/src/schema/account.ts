/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Address } from '@solana/addresses';
import { DataSlice, Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';

import { resolveAccount } from '../resolvers/account';

export type AccountQueryArgs = {
    address: Address;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    commitment?: 'processed' | 'confirmed' | 'finalized';
    minContextSlot?: Slot;
};

export const accountTypeDefs = /* GraphQL */ `
    # Account interface
    interface Account {
        address: String
        encoding: String
        executable: Boolean
        lamports: BigInt
        owner: Account
        rentEpoch: BigInt
    }

    # An account with base58 encoded data
    type AccountBase58 implements Account {
        address: String
        data: String
        encoding: String
        executable: Boolean
        lamports: BigInt
        owner: Account
        rentEpoch: BigInt
    }

    # An account with base64 encoded data
    type AccountBase64 implements Account {
        address: String
        data: String
        encoding: String
        executable: Boolean
        lamports: BigInt
        owner: Account
        rentEpoch: BigInt
    }

    # An account with base64+zstd encoded data
    type AccountBase64Zstd implements Account {
        address: String
        data: String
        encoding: String
        executable: Boolean
        lamports: BigInt
        owner: Account
        rentEpoch: BigInt
    }

    # Interface for JSON-parsed meta
    type JsonParsedAccountMeta {
        program: String
        space: BigInt
        type: String
    }
    interface AccountJsonParsed {
        meta: JsonParsedAccountMeta
    }

    # A nonce account
    type NonceAccountFeeCalculator {
        lamportsPerSignature: String
    }
    type NonceAccountData {
        authority: Account
        blockhash: String
        feeCalculator: NonceAccountFeeCalculator
    }
    type NonceAccount implements Account & AccountJsonParsed {
        address: String
        data: NonceAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }

    # A lookup table account
    type LookupTableAccountData {
        addresses: [String]
        authority: Account
        deactivationSlot: String
        lastExtendedSlot: String
        lastExtendedSlotStartIndex: Int
    }
    type LookupTableAccount implements Account & AccountJsonParsed {
        address: String
        data: LookupTableAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }

    # A mint account
    type MintAccountData {
        decimals: Int
        freezeAuthority: Account
        isInitialized: Boolean
        mintAuthority: Account
        supply: String
    }
    type MintAccount implements Account & AccountJsonParsed {
        address: String
        data: MintAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }

    # A token account
    type TokenAccountData {
        isNative: Boolean
        mint: Account
        owner: Account
        state: String
        tokenAmount: TokenAmount
    }
    type TokenAccount implements Account & AccountJsonParsed {
        address: String
        data: TokenAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }

    # A stake account
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
    type StakeAccountData {
        meta: StakeAccountDataMeta
        stake: StakeAccountDataStake
    }
    type StakeAccount implements Account & AccountJsonParsed {
        address: String
        data: StakeAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }

    # A vote account
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
    type VoteAccountData {
        authorizedVoters: [VoteAccountDataAuthorizedVoter]
        authorizedWithdrawer: Account
        commission: Int
        epochCredits: [VoteAccountDataEpochCredit]
        lastTimestamp: VoteAccountDataLastTimestamp
        node: Account
        priorVoters: [String]
        rootSlot: BigInt
        votes: [VoteAccountDataVote]
    }
    type VoteAccount implements Account & AccountJsonParsed {
        address: String
        data: VoteAccountData
        encoding: String
        executable: Boolean
        lamports: BigInt
        meta: JsonParsedAccountMeta
        owner: Account
        rentEpoch: BigInt
    }
`;

export const accountResolvers = {
    Account: {
        __resolveType(account: { encoding: string; meta: { program: string; type: string } }) {
            if (account.encoding === 'base58') {
                return 'AccountBase58';
            }
            if (account.encoding === 'base64') {
                return 'AccountBase64';
            }
            if (account.encoding === 'base64+zstd') {
                return 'AccountBase64Zstd';
            }
            if (account.encoding === 'jsonParsed') {
                if (account.meta.program === 'nonce') {
                    return 'NonceAccount';
                }
                if (account.meta.type === 'mint' && account.meta.program === 'spl-token') {
                    return 'MintAccount';
                }
                if (account.meta.type === 'account' && account.meta.program === 'spl-token') {
                    return 'TokenAccount';
                }
                if (account.meta.program === 'stake') {
                    return 'StakeAccount';
                }
                if (account.meta.type === 'vote' && account.meta.program === 'vote') {
                    return 'VoteAccount';
                }
                if (account.meta.type === 'lookupTable' && account.meta.program === 'address-lookup-table') {
                    return 'LookupTableAccount';
                }
            }
            return 'AccountBase64';
        },
    },
    AccountBase58: {
        owner: resolveAccount('owner'),
    },
    AccountBase64: {
        owner: resolveAccount('owner'),
    },
    AccountBase64Zstd: {
        owner: resolveAccount('owner'),
    },
    NonceAccountData: {
        authority: resolveAccount('authority'),
    },
    NonceAccount: {
        owner: resolveAccount('owner'),
    },
    LookupTableAccountData: {
        authority: resolveAccount('authority'),
    },
    LookupTableAccount: {
        owner: resolveAccount('owner'),
    },
    MintAccountData: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
    },
    MintAccount: {
        owner: resolveAccount('owner'),
    },
    TokenAccountData: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    TokenAccount: {
        owner: resolveAccount('owner'),
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
    StakeAccount: {
        owner: resolveAccount('owner'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
    VoteAccountData: {
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('nodePubkey'),
    },
    VoteAccount: {
        owner: resolveAccount('owner'),
    },
};
