import { Address } from '@solana/addresses';
import type { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { ProgramAccountsLoaderArgs } from '../loaders';
import { transformLoadedAccount } from './account';
import { onlyPresentFieldRequested } from './resolve-info';

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
        if (onlyPresentFieldRequested('programAddress', info)) {
            return { programAddress };
        }
        const programAccounts = await context.loaders.programAccounts.load({ ...args, programAddress });
        return programAccounts === null
            ? { programAddress }
            : programAccounts.map(programAccount =>
                  transformLoadedAccount({
                      account: programAccount.account,
                      address: programAccount.pubkey,
                      encoding: args.encoding,
                  }),
              );
    };
}
