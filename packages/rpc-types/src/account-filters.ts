import type { U64UnsafeBeyond2Pow53Minus1 } from './typed-numbers';

export type DataSlice = Readonly<{
    length: number;
    offset: number;
}>;

export type GetProgramAccountsMemcmpFilter = Readonly<{
    bytes: string;
    encoding: 'base58' | 'base64';
    offset: U64UnsafeBeyond2Pow53Minus1;
}>;

export type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;
