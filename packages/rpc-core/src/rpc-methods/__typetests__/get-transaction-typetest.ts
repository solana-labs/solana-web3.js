import { Signature } from '@solana/keys';
import { Base58EncodedDataResponse, Base64EncodedDataResponse, Commitment, Rpc } from '@solana/rpc-types';

import { GetTransactionApi, TransactionJson, TransactionJsonParsed } from '../getTransaction';

const rpc = null as unknown as Rpc<GetTransactionApi>;
const signature = 'JoeSignature4444444444444444444444444444' as Signature;

// Parameters
const params = null as unknown as Parameters<GetTransactionApi['getTransaction']>[1];
params satisfies { commitment?: Commitment } | undefined;
params satisfies { encoding?: 'jsonParsed' | 'json' | 'base58' | 'base64' } | undefined;
params satisfies { maxSupportedTransactionVersion?: 'legacy' | 0 } | undefined;

async () => {
    {
        const result = await rpc.getTransaction(signature, { encoding: 'jsonParsed' }).send();
        if (result) {
            result.transaction satisfies TransactionJsonParsed;
            // @ts-expect-error should not be `base58`
            result.transaction satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            result.transaction satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `json`
            result.transaction satisfies TransactionJson;
        }
    }

    {
        const result = await rpc.getTransaction(signature, { encoding: 'base64' }).send();
        if (result) {
            result.transaction satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `base58`
            result.transaction satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `json`
            result.transaction satisfies TransactionJson;
            // @ts-expect-error should not be `jsonParsed`
            result.transaction satisfies TransactionJsonParsed;
        }
    }

    {
        const result = await rpc.getTransaction(signature, { encoding: 'base58' }).send();
        if (result) {
            result.transaction satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            result.transaction satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `json`
            result.transaction satisfies TransactionJson;
            // @ts-expect-error should not be `jsonParsed`
            result.transaction satisfies TransactionJsonParsed;
        }
    }

    {
        const result = await rpc.getTransaction(signature, { encoding: 'json' }).send();
        if (result) {
            result.transaction satisfies TransactionJson;
            // @ts-expect-error should not be `base58`
            result.transaction satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            result.transaction satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `jsonParsed`
            result.transaction satisfies TransactionJsonParsed;
        }
    }

    {
        const result = await rpc.getTransaction(signature).send();
        if (result) {
            result.transaction satisfies TransactionJson;
            // @ts-expect-error should not be `base58`
            result.transaction satisfies Base58EncodedDataResponse;
            // @ts-expect-error should not be `base64`
            result.transaction satisfies Base64EncodedDataResponse;
            // @ts-expect-error should not be `jsonParsed`
            result.transaction satisfies TransactionJsonParsed;
        }
    }
};
