export type JsonParsedDataResponse<TData = object> = Readonly<{
    parsed: {
        info?: TData;
        type: string;
    };
    // Name of the program that owns this account.
    program: string;
    space: bigint;
}>;
