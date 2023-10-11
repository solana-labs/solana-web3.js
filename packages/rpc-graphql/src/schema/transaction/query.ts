import { Commitment } from '@solana/rpc-core';
import { TransactionSignature, TransactionVersion } from '@solana/transactions';

export type TransactionQueryArgs = {
    signature: TransactionSignature;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'jsonParsed' | 'json';
    maxSupportedTransactionVersion?: Exclude<TransactionVersion, 'legacy'>;
};
