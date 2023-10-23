import { Base58EncodedAddress } from '@solana/addresses';
import {
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    Slot,
} from '@solana/rpc-core/dist/types/rpc-methods/common';
import { Commitment } from '@solana/rpc-types';
import { GraphQLList } from 'graphql';

import { RpcGraphQLContext } from '../../context';
import {
    accountEncodingInputType,
    commitmentInputType,
    dataSliceInputType,
    programAccountFilterInputType,
} from '../inputs';
import { bigint, list, nonNull, string, type } from '../picks';
import { programAccount } from './types';

export type ProgramAccountsQueryArgs = {
    programAddress: Base58EncodedAddress;
    commitment?: Commitment;
    dataSlice?: DataSlice;
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    filters: (GetProgramAccountsMemcmpFilter | GetProgramAccountsDatasizeFilter)[];
    minContextSlot?: Slot;
    withContext?: boolean;
};

/**
 * Program accounts root query for GraphQL
 */
export const programAccountsQuery = () => ({
    programAccounts: {
        args: {
            commitment: type(commitmentInputType()),
            dataSlice: type(dataSliceInputType()),
            encoding: type(accountEncodingInputType()),
            filters: list(type(programAccountFilterInputType())),
            minContextSlot: bigint(),
            programAddress: nonNull(string()),
            withContext: string(),
        },
        resolve: (_parent: unknown, args: ProgramAccountsQueryArgs, context: RpcGraphQLContext) =>
            context.resolveProgramAccounts(args),
        type: new GraphQLList(programAccount()),
    },
});
