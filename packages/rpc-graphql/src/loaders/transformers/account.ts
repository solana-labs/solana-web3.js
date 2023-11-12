/* eslint-disable @typescript-eslint/no-explicit-any */
import { Address } from '@solana/addresses';

import { AccountQueryArgs } from '../../schema/account';

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
    encoding,
}: {
    account: any;
    address: Address;
    encoding: AccountQueryArgs['encoding'];
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
