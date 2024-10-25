import type { U64 } from './typed-numbers';

export type DataSlice = Readonly<{
    length: number;
    offset: number;
}>;

export type GetProgramAccountsMemcmpFilter = Readonly<{
    memcmp: Readonly<{
        bytes: string;
        encoding: 'base58' | 'base64';
        offset: U64;
    }>;
}>;

export type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: U64;
}>;
