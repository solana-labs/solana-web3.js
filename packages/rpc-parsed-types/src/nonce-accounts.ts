import { Address } from '@solana/addresses';
import type { Blockhash, StringifiedBigInt } from '@solana/rpc-types';

import { RpcParsedInfo } from './rpc-parsed-type';

export type JsonParsedNonceAccount = RpcParsedInfo<{
    authority: Address;
    blockhash: Blockhash;
    feeCalculator: Readonly<{
        lamportsPerSignature: StringifiedBigInt;
    }>;
}>;
