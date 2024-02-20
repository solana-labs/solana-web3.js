import type { U64UnsafeBeyond2Pow53Minus1 } from './typed-numbers';

export type DataSlice = Readonly<{
    offset: number;
    length: number;
}>;

export type GetProgramAccountsMemcmpFilter = Readonly<{
    offset: U64UnsafeBeyond2Pow53Minus1;
    bytes: string;
    encoding: 'base58' | 'base64';
}>;

export type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;
