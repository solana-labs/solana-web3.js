import type { Blockhash, Epoch, Slot, StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type FeeCalculator = Readonly<{
    lamportsPerSignature: StringifiedBigInt;
}>;

type JsonParsedClockAccount = Readonly<{
    slot: Slot;
    epoch: Epoch;
    epochStartTimestamp: UnixTimestamp;
    leaderScheduleEpoch: Epoch;
    unixTimestamp: UnixTimestamp;
}>;

type JsonParsedEpochScheduleAccount = Readonly<{
    slotsPerEpoch: bigint;
    leaderScheduleSlotOffset: bigint;
    warmup: boolean;
    firstNormalEpoch: Epoch;
    firstNormalSlot: Slot;
}>;

type JsonParsedFeesAccount_DEPRECATED = Readonly<{
    feeCalculator: FeeCalculator;
}>;

type JsonParsedRecentBlockhashesAccount_DEPRECATED = Readonly<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}>[];

type JsonParsedRentAccount = Readonly<{
    lamportsPerByteYear: StringifiedBigInt;
    exemptionThreshold: number;
    burnPercent: number;
}>;

type JsonParsedSlotHashesAccount = Readonly<{
    hash: string;
    slot: Slot;
}>[];

type JsonParsedSlotHistoryAccount = Readonly<{
    bits: string;
    nextSlot: Slot;
}>;

type JsonParsedStakeHistoryAccount = Readonly<{
    epoch: Epoch;
    stakeHistory: Readonly<{
        activating: bigint;
        deactivating: bigint;
        effective: bigint;
    }>;
}>[];

type JsonParsedLastRestartSlotAccount = Readonly<{
    lastRestartSlot: Slot;
}>;

type JsonParsedEpochRewardsAccount = Readonly<{
    totalRewards: bigint;
    distributedRewards: bigint;
    distributionCompleteBlockHeight: bigint;
}>;

export type JsonParsedSysvarAccount =
    | RpcParsedType<'clock', JsonParsedClockAccount>
    | RpcParsedType<'epochSchedule', JsonParsedEpochScheduleAccount>
    | RpcParsedType<'fees', JsonParsedFeesAccount_DEPRECATED>
    | RpcParsedType<'recentBlockhashes', JsonParsedRecentBlockhashesAccount_DEPRECATED>
    | RpcParsedType<'rent', JsonParsedRentAccount>
    | RpcParsedType<'slotHashes', JsonParsedSlotHashesAccount>
    | RpcParsedType<'slotHistory', JsonParsedSlotHistoryAccount>
    | RpcParsedType<'stakeHistory', JsonParsedStakeHistoryAccount>
    | RpcParsedType<'lastRestartSlot', JsonParsedLastRestartSlotAccount>
    | RpcParsedType<'epochRewards', JsonParsedEpochRewardsAccount>;
