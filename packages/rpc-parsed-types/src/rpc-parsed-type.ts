export type RpcParsedType<TType extends string, TInfo> = Readonly<{
    info: TInfo;
    type: TType;
}>;

export type RpcParsedInfo<TInfo> = Readonly<{
    info: TInfo;
}>;
