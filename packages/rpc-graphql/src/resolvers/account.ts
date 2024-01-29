import { Address } from '@solana/addresses';
import { Commitment, Slot } from '@solana/rpc-types';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../loaders';
import { determineAccountLoaderArgs, onlyFieldsRequested } from './resolve-info';

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

export function transformLoadedAccount(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: any,
    args: AccountLoaderArgs,
) {
    const { address, commitment, dataSlice, encoding, minContextSlot } = args;
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
    account.commitment = commitment;
    account.dataSlice = dataSlice;
    account.encoding = responseEncoding;
    account.minContextSlot = minContextSlot;
    account.ownerProgram = account.owner;
    return {
        ...account,
        ...data,
    };
}

export const resolveAccount = (fieldName?: string) => {
    return async (
        parent: { [x: string]: Address },
        args: { address?: Address; commitment?: Commitment; minContextSlot?: Slot },
        context: RpcGraphQLContext,
        info: GraphQLResolveInfo | undefined,
    ) => {
        const address = fieldName ? parent[fieldName] : args.address;
        if (!address) {
            return null;
        }
        // Don't go to the loader if only the address and/or data is requested
        if (onlyFieldsRequested(['address', 'data'], info)) {
            return { ...args, address };
        }
        const loaderArgs: AccountLoaderArgs = { ...args, address };
        determineAccountLoaderArgs(loaderArgs, info);
        const account = await context.loaders.account.load(loaderArgs);
        return account === null ? { address } : transformLoadedAccount(account, loaderArgs);
    };
};

export const resolveAccountData = () => {
    return async (
        parent: { address: Address; commitment?: Commitment; minContextSlot?: Slot },
        args: { encoding: AccountLoaderArgs['encoding']; dataSlice?: AccountLoaderArgs['dataSlice'] },
        context: RpcGraphQLContext,
    ) => {
        const { address, commitment, minContextSlot } = parent;
        const { dataSlice, encoding } = args;
        const loaderArgs = { address, commitment, dataSlice, encoding, minContextSlot };
        const account = await context.loaders.account.load(loaderArgs);
        return account === null ? null : transformLoadedAccount(account, loaderArgs).data;
    };
};

export const accountResolvers = {
    Account: {
        __resolveType(account: { encoding: string; programName: string; accountType: string }) {
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
            return 'GenericAccount';
        },
        data: resolveAccountData(),
    },
    GenericAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    LookupTableAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    MintAccount: {
        data: resolveAccountData(),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        data: resolveAccountData(),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccount: {
        data: resolveAccountData(),
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
        data: resolveAccountData(),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccount: {
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        data: resolveAccountData(),
        node: resolveAccount('nodePubkey'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
};
