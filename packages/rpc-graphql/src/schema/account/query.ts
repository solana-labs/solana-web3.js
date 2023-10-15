import { Base58EncodedAddress } from '@solana/addresses';
import { Commitment } from '@solana/rpc-core';
import { DataSlice, Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';

import { RpcGraphQLContext } from '../../context';
import { accountEncodingInputType, commitmentInputType, dataSliceInputType } from '../inputs';
import { bigint, nonNull, string, type } from '../picks';
import { accountInterface } from './types';

export type AccountQueryArgs = {
    address: Base58EncodedAddress;
    commitment?: Commitment;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    minContextSlot?: Slot;
};

/**
 * Account root query for GraphQL
 */
export const accountQuery = () => ({
    account: {
        args: {
            address: nonNull(string()),
            commitment: type(commitmentInputType()),
            dataSlice: type(dataSliceInputType()),
            encoding: type(accountEncodingInputType()),
            minContextSlot: bigint(),
        },
        resolve: (_parent: unknown, args: AccountQueryArgs, context: RpcGraphQLContext) => context.resolveAccount(args),
        type: accountInterface(),
    },
});
