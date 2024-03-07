import { Address } from '@solana/addresses';
import { Commitment, Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { ProgramAccountsLoaderArgs } from '../../loaders';
import { buildAccountArgSetWithVisitor } from './account';

/**
 * Build a set of account loader args by inspecting which fields have
 * been requested in the query (ie. `data` or inline fragments).
 */
export function buildProgramAccountsLoaderArgSetFromResolveInfo(
    args: {
        commitment?: Commitment;
        filters?: readonly { memcmp: { bytes: string; offset: number } }[];
        minContextSlot?: Slot;
        programAddress: Address;
    },
    info: GraphQLResolveInfo,
): ProgramAccountsLoaderArgs[] {
    return buildAccountArgSetWithVisitor(args, info);
}
