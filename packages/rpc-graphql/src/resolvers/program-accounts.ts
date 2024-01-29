import { Address } from '@solana/addresses';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { ProgramAccountsLoaderArgs } from '../loaders';
import { transformLoadedAccount } from './account';
import { onlyFieldsRequested } from './resolve-info';

export function resolveProgramAccounts(fieldName?: string) {
    return async (
        parent: { [x: string]: Address },
        args: ProgramAccountsLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        const programAddress = fieldName ? parent[fieldName] : args.programAddress;
        if (!programAddress) {
            return null;
        }
        if (onlyFieldsRequested(['programAddress'], info)) {
            return { programAddress };
        }
        const programAccounts = await context.loaders.programAccounts.load({ ...args, programAddress });
        return programAccounts === null
            ? { programAddress }
            : programAccounts.map(programAccount => {
                  const { commitment, dataSlice, encoding, minContextSlot } = args;
                  const address = programAccount.pubkey;
                  return transformLoadedAccount(programAccount.account, {
                      address,
                      commitment,
                      dataSlice,
                      encoding,
                      minContextSlot,
                  });
              });
    };
}
