import type { Blockhash, Epoch, Slot, StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type FeeCalculator = Readonly<{
    lamportsPerSignature: StringifiedBigInt;
}>;

type ClockAccount = Readonly<{
    slot: Slot;
    epoch: Epoch;
    epochStartTimestamp: UnixTimestamp;
    leaderScheduleEpoch: Epoch;
    unixTimestamp: UnixTimestamp;
}>;

type EpochScheduleAccount = Readonly<{
    slotsPerEpoch: bigint;
    leaderScheduleSlotOffset: bigint;
    warmup: boolean;
    firstNormalEpoch: Epoch;
    firstNormalSlot: Slot;
}>;

type FeesAccount_DEPRECATED = Readonly<{
    feeCalculator: FeeCalculator;
}>;

type RecentBlockhashesAccount_DEPRECATED = Readonly<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}>[];

type RentAccount = Readonly<{
    lamportsPerByteYear: StringifiedBigInt;
    exemptionThreshold: number;
    burnPercent: number;
}>;

type SlotHashesAccount = Readonly<{
    hash: string;
    slot: Slot;
}>[];

type SlotHistoryAccount = Readonly<{
    bits: string;
    nextSlot: Slot;
}>;

type StakeHistoryAccount = Readonly<{
    epoch: Epoch;
    stakeHistory: Readonly<{
        activating: bigint;
        deactivating: bigint;
        effective: bigint;
    }>;
}>[];

type LastRestartSlotAccount = Readonly<{
    lastRestartSlot: Slot;
}>;

export type SysvarProgramAccount =
    | RpcParsedType<'clock', ClockAccount>
    | RpcParsedType<'epochSchedule', EpochScheduleAccount>
    | RpcParsedType<'fees', FeesAccount_DEPRECATED>
    | RpcParsedType<'recentBlockhashes', RecentBlockhashesAccount_DEPRECATED>
    | RpcParsedType<'rent', RentAccount>
    | RpcParsedType<'slotHashes', SlotHashesAccount>
    | RpcParsedType<'slotHistory', SlotHistoryAccount>
    | RpcParsedType<'stakeHistory', StakeHistoryAccount>
    | RpcParsedType<'lastRestartSlot', LastRestartSlotAccount>;
