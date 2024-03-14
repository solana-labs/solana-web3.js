import type { MaybeAccount, MaybeEncodedAccount } from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { JsonParsedSysvarAccount } from '@solana/rpc-parsed-types';

import { fetchSysvarClock, type SysvarClock } from '../clock';
import { fetchSysvarEpochRewards, type SysvarEpochRewards } from '../epoch-rewards';
import { fetchSysvarEpochSchedule, type SysvarEpochSchedule } from '../epoch-schedule';
import { fetchSysvarFees, type SysvarFees } from '../fees';
import { fetchSysvarLastRestartSlot, type SysvarLastRestartSlot } from '../last-restart-slot';
import { fetchSysvarRecentBlockhashes, type SysvarRecentBlockhashes } from '../recent-blockhashes';
import { fetchSysvarRent, type SysvarRent } from '../rent';
import { fetchSysvarSlotHashes, type SysvarSlotHashes } from '../slot-hashes';
import { fetchSysvarSlotHistory, type SysvarSlotHistory } from '../slot-history';
import { fetchSysvarStakeHistory, type SysvarStakeHistory } from '../stake-history';
import { fetchEncodedSysvarAccount, fetchJsonParsedSysvarAccount, SYSVAR_CLOCK_ADDRESS } from '../sysvar';

const rpc = null as unknown as Parameters<typeof fetchEncodedSysvarAccount>[0];

// `fetchEncodedSysvarAccount`
{
    // Only accepts a valid sysvar address.
    fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS);
    // @ts-expect-error Only accepts a valid sysvar address.
    fetchEncodedSysvarAccount(rpc, 'Foo1111' as Address<'Foo1111'>);

    // Returns a `MaybeEncodedAccount` with the provided sysvar address.
    fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS) satisfies Promise<
        MaybeEncodedAccount<typeof SYSVAR_CLOCK_ADDRESS>
    >;
    // @ts-expect-error Returns a `MaybeEncodedAccount` with the provided sysvar address.
    fetchEncodedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS) satisfies Promise<MaybeEncodedAccount<Address<'Foo1111'>>>;
}

// `fetchJsonParsedSysvarAccount`
{
    // Only accepts a valid sysvar address.
    fetchJsonParsedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS);
    // @ts-expect-error Only accepts a valid sysvar address.
    fetchJsonParsedSysvarAccount(rpc, 'Foo1111' as Address<'Foo1111'>);

    // Returns an `MaybeAccount or MaybeEncodedAccount` with the provided sysvar address,
    // as well as the `JsonParsedSysvarAccount` data.
    fetchJsonParsedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS) satisfies Promise<
        | MaybeAccount<JsonParsedSysvarAccount, typeof SYSVAR_CLOCK_ADDRESS>
        | MaybeEncodedAccount<typeof SYSVAR_CLOCK_ADDRESS>
    >;
    // @ts-expect-error Returns an `MaybeAccount or MaybeEncodedAccount` with the provided address.
    fetchJsonParsedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS) satisfies Promise<
        MaybeAccount<JsonParsedSysvarAccount, Address<'Foo1111'>> | MaybeEncodedAccount<Address<'Foo1111'>>
    >;
    // @ts-expect-error Returns an `MaybeAccount or MaybeEncodedAccount` with `JsonParsedSysvarAccount` data.
    fetchJsonParsedSysvarAccount(rpc, SYSVAR_CLOCK_ADDRESS) satisfies Promise<
        MaybeAccount<{ foo: string }, typeof SYSVAR_CLOCK_ADDRESS> | MaybeEncodedAccount<typeof SYSVAR_CLOCK_ADDRESS>
    >;
}

// `fetchSysvarClock`
{
    // Returns a `SysvarClock`.
    fetchSysvarClock(rpc) satisfies Promise<SysvarClock>;
    // @ts-expect-error Returns a `SysvarClock`.
    fetchSysvarClock(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarEpochRewards`
{
    // Returns a `SysvarEpochRewards`.
    fetchSysvarEpochRewards(rpc) satisfies Promise<SysvarEpochRewards>;
    // @ts-expect-error Returns a `SysvarEpochRewards`.
    fetchSysvarEpochRewards(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarEpochSchedule`
{
    // Returns a `SysvarEpochSchedule`.
    fetchSysvarEpochSchedule(rpc) satisfies Promise<SysvarEpochSchedule>;
    // @ts-expect-error Returns a `SysvarEpochSchedule`.
    fetchSysvarEpochSchedule(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarFees`
{
    // Returns a `SysvarFees`.
    fetchSysvarFees(rpc) satisfies Promise<SysvarFees>;
    // @ts-expect-error Returns a `SysvarFees`.
    fetchSysvarFees(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarLastRestartSlot`
{
    // Returns a `SysvarLastRestartSlot`.
    fetchSysvarLastRestartSlot(rpc) satisfies Promise<SysvarLastRestartSlot>;
    // @ts-expect-error Returns a `SysvarLastRestartSlot`.
    fetchSysvarLastRestartSlot(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarRecentBlockhashes`
{
    // Returns a `SysvarRecentBlockhashes`.
    fetchSysvarRecentBlockhashes(rpc) satisfies Promise<SysvarRecentBlockhashes>;
    // @ts-expect-error Returns a `SysvarRecentBlockhashes`.
    fetchSysvarRecentBlockhashes(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarRent`
{
    // Returns a `SysvarRent`.
    fetchSysvarRent(rpc) satisfies Promise<SysvarRent>;
    // @ts-expect-error Returns a `SysvarRent`.
    fetchSysvarRent(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarSlotHashes`
{
    // Returns a `SysvarSlotHashes`.
    fetchSysvarSlotHashes(rpc) satisfies Promise<SysvarSlotHashes>;
    // @ts-expect-error Returns a `SysvarSlotHashes`.
    fetchSysvarSlotHashes(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarSlotHistory`
{
    // Returns a `SysvarSlotHistory`.
    fetchSysvarSlotHistory(rpc) satisfies Promise<SysvarSlotHistory>;
    // @ts-expect-error Returns a `SysvarSlotHistory`.
    fetchSysvarSlotHistory(rpc) satisfies Promise<{ foo: string }>;
}

// `fetchSysvarStakeHistory`
{
    // Returns a `SysvarStakeHistory`.
    fetchSysvarStakeHistory(rpc) satisfies Promise<SysvarStakeHistory>;
    // @ts-expect-error Returns a `SysvarStakeHistory`.
    fetchSysvarStakeHistory(rpc) satisfies Promise<{ foo: string }>;
}
