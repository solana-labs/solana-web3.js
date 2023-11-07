import { Address } from '@solana/addresses';
import { DataSlice, Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { Commitment } from '@solana/rpc-types';

import { RpcGraphQLContext } from '../../context';
import { accountEncodingInputType, commitmentInputType, dataSliceInputType } from '../inputs';
import { bigint, nonNull, string, type } from '../picks';
import { accountInterface } from './types';

export type AccountQueryArgs = {
    address: Address;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve: (_parent: unknown, args: AccountQueryArgs, context: RpcGraphQLContext, info: any) =>
            context.resolveAccount(args, info),
        type: accountInterface(),
    },
});
