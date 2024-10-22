import { isJsonRpcPayload } from '@solana/rpc-spec';

const SOLANA_RPC_METHODS = [
    'getAccountInfo',
    'getBalance',
    'getBlock',
    'getBlockCommitment',
    'getBlockHeight',
    'getBlockProduction',
    'getBlocks',
    'getBlocksWithLimit',
    'getBlockTime',
    'getClusterNodes',
    'getEpochInfo',
    'getEpochSchedule',
    'getFeeForMessage',
    'getFirstAvailableBlock',
    'getGenesisHash',
    'getHealth',
    'getHighestSnapshotSlot',
    'getIdentity',
    'getInflationGovernor',
    'getInflationRate',
    'getInflationReward',
    'getLargestAccounts',
    'getLatestBlockhash',
    'getLeaderSchedule',
    'getMaxRetransmitSlot',
    'getMaxShredInsertSlot',
    'getMinimumBalanceForRentExemption',
    'getMultipleAccounts',
    'getProgramAccounts',
    'getRecentPerformanceSamples',
    'getRecentPrioritizationFees',
    'getSignaturesForAddress',
    'getSignatureStatuses',
    'getSlot',
    'getSlotLeader',
    'getSlotLeaders',
    'getStakeMinimumDelegation',
    'getSupply',
    'getTokenAccountBalance',
    'getTokenAccountsByDelegate',
    'getTokenAccountsByOwner',
    'getTokenLargestAccounts',
    'getTokenSupply',
    'getTransaction',
    'getTransactionCount',
    'getVersion',
    'getVoteAccounts',
    'index',
    'isBlockhashValid',
    'minimumLedgerSlot',
    'requestAirdrop',
    'sendTransaction',
    'simulateTransaction',
] as const;

/**
 * Helper function that checks if a given `RpcRequest` comes from the Solana RPC API.
 */
export function isSolanaRequest(payload: unknown): payload is Readonly<{
    jsonrpc: '2.0';
    method: (typeof SOLANA_RPC_METHODS)[number];
    params: unknown;
}> {
    return isJsonRpcPayload(payload) && (SOLANA_RPC_METHODS as readonly string[]).includes(payload.method);
}
