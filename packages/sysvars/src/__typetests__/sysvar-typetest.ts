import type { MaybeAccount, MaybeEncodedAccount } from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { JsonParsedSysvarAccount } from '@solana/rpc-parsed-types';

import { fetchSysvarClock, type SysvarClock } from '../clock';
import { fetchSysvarEpochRewards, type SysvarEpochRewards } from '../epoch-rewards';
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
