import { Blockhash, Epoch, Slot, StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { JsonParsedSysvarAccount } from '../sysvar-accounts';

// clock sysvar
{
    const account = {
        info: {
            epoch: 0n as Epoch,
            epochStartTimestamp: 1704907181 as UnixTimestamp,
            leaderScheduleEpoch: 1n as Epoch,
            slot: 90829n as Slot,
            unixTimestamp: 1704998009 as UnixTimestamp,
        },
        type: 'clock' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'clock') {
        account.info.epoch satisfies Epoch;
    }
}

// epoch schedule account
{
    const account = {
        info: {
            firstNormalEpoch: 0n as Epoch,
            firstNormalSlot: 0n as Slot,
            leaderScheduleSlotOffset: 432000n,
            slotsPerEpoch: 432000n,
            warmup: false,
        },
        type: 'epochSchedule' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'epochSchedule') {
        account.info.firstNormalEpoch satisfies Epoch;
    }
}

// fees account
{
    const account = {
        info: {
            feeCalculator: {
                lamportsPerSignature: '0' as StringifiedBigInt,
            },
        },
        type: 'fees' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'fees') {
        account.info.feeCalculator.lamportsPerSignature satisfies StringifiedBigInt;
    }
}

// recent blockhashes account
{
    const account = {
        info: [
            {
                blockhash: 'Gy5GKD5p7UmUWF2BEm3TAUP4PSLTw9puSUbuoH5xPdzk' as Blockhash,
                feeCalculator: {
                    lamportsPerSignature: '5000' as StringifiedBigInt,
                },
            },
            {
                blockhash: 'FvNKRQk7TuFXVmXEM4XEubXdYREaeiWX56SL97taEhAQ' as Blockhash,
                feeCalculator: {
                    lamportsPerSignature: '5000' as StringifiedBigInt,
                },
            },
        ],
        type: 'recentBlockhashes' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'recentBlockhashes') {
        account.info[0].blockhash satisfies Blockhash;
    }
}

// rent account
{
    const account = {
        info: {
            burnPercent: 50,
            exemptionThreshold: 2.0,
            lamportsPerByteYear: '3480' as StringifiedBigInt,
        },
        type: 'rent' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'rent') {
        account.info.burnPercent satisfies number;
    }
}

// slot hashes account
{
    const account = {
        info: [
            {
                hash: 'BAwX3h9EtGqBGnvXqgBoTZL19iHY8PKeCS9AVWFsVLQ8',
                slot: 149694n as Slot,
            },
            {
                hash: '7HdyQAb5kaZ9RjTuX8uejYXj86J3P2foNfDkqLAFNYFF',
                slot: 149693n as Slot,
            },
        ],
        type: 'slotHashes' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'slotHashes') {
        account.info[0].hash satisfies string;
    }
}

// slot history account
{
    const account = {
        info: {
            bits: '1111100000',
            nextSlot: 150104n as Slot,
        },
        type: 'slotHistory' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'slotHistory') {
        account.info.bits satisfies string;
    }
}

// stake history account
{
    const account = {
        info: [
            {
                epoch: 683n as Epoch,
                stakeHistory: {
                    activating: 0n,
                    deactivating: 0n,
                    effective: 6561315032320n,
                },
            },
            {
                epoch: 682n as Epoch,
                stakeHistory: {
                    activating: 0n,
                    deactivating: 0n,
                    effective: 506560815032320n,
                },
            },
        ],
        type: 'stakeHistory' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'stakeHistory') {
        account.info[0].epoch satisfies Epoch;
    }
}

// last restart slot account
{
    const account = {
        info: {
            lastRestartSlot: 0n as Slot,
        },
        type: 'lastRestartSlot' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'lastRestartSlot') {
        account.info.lastRestartSlot satisfies Slot;
    }
}

// epoch rewards account
{
    const account = {
        info: {
            distributedRewards: 100n,
            distributionCompleteBlockHeight: 1000n,
            totalRewards: 200n,
        },
        type: 'epochRewards' as const,
    };
    account satisfies JsonParsedSysvarAccount;
}

{
    const account = {} as unknown as JsonParsedSysvarAccount;
    if (account.type === 'epochRewards') {
        account.info.totalRewards satisfies bigint;
    }
}
