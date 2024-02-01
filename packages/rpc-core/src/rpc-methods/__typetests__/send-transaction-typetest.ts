import { Signature } from '@solana/keys';
import { Base58EncodedBytes, Commitment, Rpc, Slot } from '@solana/rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';

import { SendTransactionApi } from '../sendTransaction';

const rpc = null as unknown as Rpc<SendTransactionApi>;
const transactionBase58 = null as unknown as Base58EncodedBytes;
const transactionBase64 = null as unknown as Base64EncodedWireTransaction;

// Parameters
const params = null as unknown as Parameters<SendTransactionApi['sendTransaction']>[1];
params satisfies { encoding?: 'base58' | 'base64' } | undefined;
params satisfies { maxRetries?: bigint } | undefined;
params satisfies { minContextSlot?: Slot } | undefined;
params satisfies { preflightCommitment?: Commitment } | undefined;
params satisfies { skipPreflight?: boolean } | undefined;

async () => {
    {
        const result = await rpc.sendTransaction(transactionBase58, { encoding: 'base58' }).send();
        result satisfies Signature;
    }
    {
        const result = await rpc.sendTransaction(transactionBase64, { encoding: 'base64' }).send();
        result satisfies Signature;
    }
    // @ts-expect-error can't mix encodings
    rpc.sendTransaction(transactionBase58, { encoding: 'base64' });
    // @ts-expect-error can't mix encodings
    rpc.sendTransaction(transactionBase64, { encoding: 'base58' });
};
