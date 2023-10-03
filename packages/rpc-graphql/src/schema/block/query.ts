import { Commitment } from '@solana/rpc-core';
import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { TransactionVersion } from '@solana/transactions';

export type BlockQueryArgs = {
    slot: Slot;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    maxSupportedTransactionVersion?: Exclude<TransactionVersion, 'legacy'>;
    rewards?: boolean;
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};
