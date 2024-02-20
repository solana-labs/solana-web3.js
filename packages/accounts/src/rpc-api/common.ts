import type { U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

export type JsonParsedDataResponse<TData = object> = Readonly<{
    // Name of the program that owns this account.
    program: string;
    parsed: {
        info?: TData;
        type: string;
    };
    space: U64UnsafeBeyond2Pow53Minus1;
}>;
