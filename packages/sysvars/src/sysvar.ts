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

type SysvarAddress =
    | typeof SYSVAR_CLOCK_ADDRESS
    | typeof SYSVAR_EPOCH_REWARDS_ADDRESS
    | typeof SYSVAR_EPOCH_SCHEDULE_ADDRESS
    | typeof SYSVAR_FEES_ADDRESS
    | typeof SYSVAR_INSTRUCTIONS_ADDRESS;

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
    return fetchEncodedAccount<TAddress>(rpc, address, config);
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
    return fetchJsonParsedAccount<JsonParsedSysvarAccount, TAddress>(rpc, address, config);
}
