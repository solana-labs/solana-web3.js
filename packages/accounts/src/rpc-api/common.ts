import type { U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

export type JsonParsedDataResponse<TData = object> = Readonly<{
    parsed: {
        info?: TData;
        type: string;
    };
    // Name of the program that owns this account.
    program: string;
    space: U64UnsafeBeyond2Pow53Minus1;
}>;
