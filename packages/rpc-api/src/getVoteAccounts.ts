import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type Epoch = U64UnsafeBeyond2Pow53Minus1;
type Credits = U64UnsafeBeyond2Pow53Minus1;
type PreviousCredits = U64UnsafeBeyond2Pow53Minus1;

type EpochCredit = [Epoch, Credits, PreviousCredits];

type VoteAccount<TVotePubkey extends Address> = Readonly<{
    /** the stake, in lamports, delegated to this vote account and active in this epoch */
    activatedStake: U64UnsafeBeyond2Pow53Minus1;
    /** percentage (0-100) of rewards payout owed to the vote account */
    commission: number;
    /** Latest history of earned credits for up to five epochs */
    epochCredits: readonly EpochCredit[];
    /** whether the vote account is staked for this epoch */
    epochVoteAccount: boolean;
    /** Most recent slot voted on by this vote account */
    lastVote: U64UnsafeBeyond2Pow53Minus1;
    /** Validator identity */
    nodePubkey: Address;
    /** Current root slot for this vote account */
    rootSlot: Slot;
    /** Vote account address */
    votePubkey: TVotePubkey;
}>;

type GetVoteAccountsApiResponse<TVotePubkey extends Address> = Readonly<{
    current: readonly VoteAccount<TVotePubkey>[];
    delinquent: readonly VoteAccount<TVotePubkey>[];
}>;

type GetVoteAccountsConfig<TVotePubkey extends Address> = Readonly<{
    commitment?: Commitment;
    /** Specify the number of slots behind the tip that a validator must fall to be considered delinquent. **NOTE:** For the sake of consistency between ecosystem products, _it is **not** recommended that this argument be specified._ */
    delinquentSlotDistance?: U64UnsafeBeyond2Pow53Minus1;
    /** Do not filter out delinquent validators with no stake */
    keepUnstakedDelinquents?: boolean;
    /** Only return results for this validator vote address */
    votePubkey?: TVotePubkey;
}>;

export interface GetVoteAccountsApi extends RpcApiMethods {
    /** Returns the account info and associated stake for all the voting accounts in the current bank. */
    getVoteAccounts<TVoteAccount extends Address>(
        config?: GetVoteAccountsConfig<TVoteAccount>,
    ): GetVoteAccountsApiResponse<TVoteAccount>;
}
