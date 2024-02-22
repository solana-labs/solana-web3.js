import { KeyPath, KEYPATH_WILDCARD } from './tree-traversal';

export type AllowedNumericKeypaths<TApi> = Partial<Record<keyof TApi, readonly KeyPath[]>>;

// Numeric values nested in `jsonParsed` accounts
export const jsonParsedTokenAccountsConfigs = [
    // parsed Token/Token22 token account
    ['data', 'parsed', 'info', 'tokenAmount', 'decimals'],
    ['data', 'parsed', 'info', 'tokenAmount', 'uiAmount'],
    ['data', 'parsed', 'info', 'rentExemptReserve', 'decimals'],
    ['data', 'parsed', 'info', 'rentExemptReserve', 'uiAmount'],
    ['data', 'parsed', 'info', 'delegatedAmount', 'decimals'],
    ['data', 'parsed', 'info', 'delegatedAmount', 'uiAmount'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'olderTransferFee', 'transferFeeBasisPoints'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'newerTransferFee', 'transferFeeBasisPoints'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'preUpdateAverageRate'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'currentRate'],
];
export const jsonParsedAccountsConfigs = [
    ...jsonParsedTokenAccountsConfigs,
    // parsed AddressTableLookup account
    ['data', 'parsed', 'info', 'lastExtendedSlotStartIndex'],
    // parsed Config account
    ['data', 'parsed', 'info', 'slashPenalty'],
    ['data', 'parsed', 'info', 'warmupCooldownRate'],
    // parsed Token/Token22 mint account
    ['data', 'parsed', 'info', 'decimals'],
    // parsed Token/Token22 multisig account
    ['data', 'parsed', 'info', 'numRequiredSigners'],
    ['data', 'parsed', 'info', 'numValidSigners'],
    // parsed Stake account
    ['data', 'parsed', 'info', 'stake', 'delegation', 'warmupCooldownRate'],
    // parsed Sysvar rent account
    ['data', 'parsed', 'info', 'exemptionThreshold'],
    ['data', 'parsed', 'info', 'burnPercent'],
    // parsed Vote account
    ['data', 'parsed', 'info', 'commission'],
    ['data', 'parsed', 'info', 'votes', KEYPATH_WILDCARD, 'confirmationCount'],
];
