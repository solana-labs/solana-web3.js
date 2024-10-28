export type DataSlice = Readonly<{
    length: number;
    offset: number;
}>;

export type GetProgramAccountsMemcmpFilter = Readonly<{
    memcmp: Readonly<{
        bytes: string;
        encoding: 'base58' | 'base64';
        offset: bigint;
    }>;
}>;

export type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: bigint;
}>;
