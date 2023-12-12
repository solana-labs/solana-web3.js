export type RpcApiConfig = Readonly<{
    parametersTransformer?: <T>(params: T, methodName: string) => unknown[];
    responseTransformer?: <T>(response: unknown, methodName: string) => T;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod = (...args: any) => any;

export interface IRpcApiMethods {
    [methodName: string]: RpcMethod;
}
