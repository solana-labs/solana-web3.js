import { Address } from '@solana/addresses';
import { Epoch, Slot, StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { RpcParsedInfo } from './rpc-parsed-type';

export type JsonParsedVoteAccount = RpcParsedInfo<{
    authorizedVoters: Readonly<{
        authorizedVoter: Address;
        epoch: Epoch;
    }>[];
    authorizedWithdrawer: Address;
    commission: number;
    epochCredits: Readonly<{
        credits: StringifiedBigInt;
        epoch: Epoch;
        previousCredits: StringifiedBigInt;
    }>[];
    lastTimestamp: Readonly<{
        slot: Slot;
        timestamp: UnixTimestamp;
    }>;
    nodePubkey: Address;
    priorVoters: Readonly<{
        authorizedPubkey: Address;
        epochOfLastAuthorizedSwitch: Epoch;
        targetEpoch: Epoch;
    }>[];
    rootSlot: Slot | null;
    votes: Readonly<{
        confirmationCount: number;
        slot: Slot;
    }>[];
}>;
