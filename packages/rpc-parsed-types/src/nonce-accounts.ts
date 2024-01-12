import { Address } from '@solana/addresses';
import type { Blockhash, StringifiedBigInt } from '@solana/rpc-types';

export type JsonParsedNonceAccount = Readonly<{
    authority: Address;
    blockhash: Blockhash;
    feeCalculator: Readonly<{
        lamportsPerSignature: StringifiedBigInt;
    }>;
}>;
