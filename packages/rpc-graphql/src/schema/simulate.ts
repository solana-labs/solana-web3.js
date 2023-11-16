/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Address } from '@solana/addresses';
import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { Commitment } from '@solana/rpc-types';
import { Base64EncodedWireTransaction } from '@solana/transactions';

export type SimulateQueryArgs = {
    transaction: Base64EncodedWireTransaction;
    accounts?: Readonly<{
        addresses: Address[];
        encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    }>;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64';
    minContextSlot?: Slot;
    replaceRecentBlockhash?: boolean;
    sigVerify?: boolean;
};

export const simulateTypeDefs = /* GraphQL */ `
    type SimulationResult {
        accounts: [Account]
        err: String
        logs: [String]
        returnData: ReturnData
        unitsConsumed: BigInt
    }
`;

export const simulateResolvers = {};
