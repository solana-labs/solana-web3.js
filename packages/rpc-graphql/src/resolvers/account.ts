import { Address } from '@solana/addresses';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../loaders';
import { onlyPresentFieldRequested } from './resolve-info';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformParsedAccountData(parsedAccountData: any) {
    const {
        parsed: { info: result, type: accountType },
        program: programName,
        programId,
    } = parsedAccountData;
    // Tells GraphQL which account type has been
    // returned by the RPC.
    result.accountType = accountType;
    result.programId = programId;
    // Tells GraphQL which program the returned
    // account belongs to.
    result.programName = programName;
    return result;
}

export function transformLoadedAccount({
    account,
    address,
    encoding = 'jsonParsed',
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: any;
    address: Address;
    encoding: AccountLoaderArgs['encoding'];
}) {
    const [
        // The account's data, either encoded or parsed.
        data,
        // Tells GraphQL which encoding has been returned
        // by the RPC.
        responseEncoding,
    ] = Array.isArray(account.data)
        ? encoding === 'jsonParsed'
            ? // The requested encoding is jsonParsed,
              // but the data could not be parsed.
              // Defaults to base64 encoding.
              [{ data: account.data[0] }, 'base64']
            : // The requested encoding is base58,
              // base64, or base64+zstd.
              [{ data: account.data[0] }, encoding]
        : // The account data was returned as an object,
          // so it was parsed successfully.
          [transformParsedAccountData(account.data), 'jsonParsed'];
    account.address = address;
    account.encoding = responseEncoding;
    account.ownerProgram = account.owner;
    return {
        ...account,
        ...data,
    };
}

export const resolveAccount = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Address },
        args: AccountLoaderArgs,
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        const address = fieldName ? parent[fieldName] : args.address;
        if (!address) {
            return null;
        }
        if (onlyPresentFieldRequested('address', info)) {
            return { address };
        }
        const account = await context.loaders.account.load({ ...args, address });
        return account === null ? { address } : transformLoadedAccount({ account, address, encoding: args.encoding });
    };
};

export const accountResolvers = {
    Account: {
        __resolveType(account: { encoding: string; programName: string; accountType: string }) {
            if (account.encoding === 'base58') {
                return 'AccountBase58';
            }
            if (account.encoding === 'base64') {
                return 'AccountBase64';
            }
            if (account.encoding === 'base64+zstd') {
                return 'AccountBase64Zstd';
            }
            if (account.encoding === 'jsonParsed') {
                if (account.programName === 'nonce') {
                    return 'NonceAccount';
                }
                if (account.accountType === 'mint' && account.programName === 'spl-token') {
                    return 'MintAccount';
                }
                if (account.accountType === 'account' && account.programName === 'spl-token') {
                    return 'TokenAccount';
                }
                if (account.programName === 'stake') {
                    return 'StakeAccount';
                }
                if (account.accountType === 'vote' && account.programName === 'vote') {
                    return 'VoteAccount';
                }
                if (account.accountType === 'lookupTable' && account.programName === 'address-lookup-table') {
                    return 'LookupTableAccount';
                }
            }
            return 'AccountBase64';
        },
    },
    AccountBase58: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    AccountBase64: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    AccountBase64Zstd: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    LookupTableAccount: {
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    MintAccount: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccount: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccountDataMetaAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeAccountDataMetaLockup: {
        custodian: resolveAccount('custodian'),
    },
    StakeAccountDataStakeDelegation: {
        voter: resolveAccount('voter'),
    },
    TokenAccount: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccount: {
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('nodePubkey'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
};
