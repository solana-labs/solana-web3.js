export function transformParsedAccountData(
    parsedAccountData: any, //eslint-disable-line @typescript-eslint/no-explicit-any
) {
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
