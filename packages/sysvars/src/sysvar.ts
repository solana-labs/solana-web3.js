import {
    type FetchAccountConfig,
    fetchEncodedAccount,
    fetchJsonParsedAccount,
    type MaybeAccount,
    type MaybeEncodedAccount,
} from '@solana/accounts';
import type { Address } from '@solana/addresses';
import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { JsonParsedSysvarAccount } from '@solana/rpc-parsed-types';
import type { Rpc } from '@solana/rpc-spec';

export const SYSVAR_CLOCK_ADDRESS =
    'SysvarC1ock11111111111111111111111111111111' as Address<'SysvarC1ock11111111111111111111111111111111'>;
export const SYSVAR_EPOCH_REWARDS_ADDRESS =
    'SysvarEpochRewards1111111111111111111111111' as Address<'SysvarEpochRewards1111111111111111111111111'>;
export const SYSVAR_EPOCH_SCHEDULE_ADDRESS =
    'SysvarEpochSchedu1e111111111111111111111111' as Address<'SysvarEpochSchedu1e111111111111111111111111'>;
export const SYSVAR_FEES_ADDRESS =
    'SysvarFees111111111111111111111111111111111' as Address<'SysvarFees111111111111111111111111111111111'>;
export const SYSVAR_INSTRUCTIONS_ADDRESS =
    'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
export const SYSVAR_LAST_RESTART_SLOT_ADDRESS =
    'SysvarLastRestartS1ot1111111111111111111111' as Address<'SysvarLastRestartS1ot1111111111111111111111'>;
export const SYSVAR_RECENT_BLOCKHASHES_ADDRESS =
    'SysvarRecentB1ockHashes11111111111111111111' as Address<'SysvarRecentB1ockHashes11111111111111111111'>;
export const SYSVAR_RENT_ADDRESS =
    'SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>;
export const SYSVAR_SLOT_HASHES_ADDRESS =
    'SysvarS1otHashes111111111111111111111111111' as Address<'SysvarS1otHashes111111111111111111111111111'>;
export const SYSVAR_SLOT_HISTORY_ADDRESS =
    'SysvarS1otHistory11111111111111111111111111' as Address<'SysvarS1otHistory11111111111111111111111111'>;
export const SYSVAR_STAKE_HISTORY_ADDRESS =
    'SysvarStakeHistory1111111111111111111111111' as Address<'SysvarStakeHistory1111111111111111111111111'>;

type SysvarAddress =
    | typeof SYSVAR_CLOCK_ADDRESS
    | typeof SYSVAR_EPOCH_REWARDS_ADDRESS
    | typeof SYSVAR_EPOCH_SCHEDULE_ADDRESS
    | typeof SYSVAR_FEES_ADDRESS
    | typeof SYSVAR_INSTRUCTIONS_ADDRESS
    | typeof SYSVAR_LAST_RESTART_SLOT_ADDRESS
    | typeof SYSVAR_RECENT_BLOCKHASHES_ADDRESS
    | typeof SYSVAR_RENT_ADDRESS
    | typeof SYSVAR_SLOT_HASHES_ADDRESS
    | typeof SYSVAR_SLOT_HISTORY_ADDRESS
    | typeof SYSVAR_STAKE_HISTORY_ADDRESS;

/**
 * Fetch an encoded sysvar account.
 *
 * Sysvars are special accounts that contain dynamically-updated data about the
 * network cluster, the blockchain history, and the executing transaction.
 */
export async function fetchEncodedSysvarAccount<TAddress extends SysvarAddress>(
    rpc: Rpc<GetAccountInfoApi>,
    address: TAddress,
    config?: FetchAccountConfig,
): Promise<MaybeEncodedAccount<TAddress>> {
    return await fetchEncodedAccount<TAddress>(rpc, address, config);
}

/**
 * Fetch a JSON-parsed sysvar account.
 *
 * Sysvars are special accounts that contain dynamically-updated data about the
 * network cluster, the blockchain history, and the executing transaction.
 */
export async function fetchJsonParsedSysvarAccount<TAddress extends SysvarAddress>(
    rpc: Rpc<GetAccountInfoApi>,
    address: TAddress,
    config?: FetchAccountConfig,
): Promise<MaybeAccount<JsonParsedSysvarAccount, TAddress> | MaybeEncodedAccount<TAddress>> {
    return await fetchJsonParsedAccount<JsonParsedSysvarAccount, TAddress>(rpc, address, config);
}
