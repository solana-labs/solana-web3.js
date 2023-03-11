import { IJsonRpcTransport } from '@solana/rpc-transport';
import { JsonRpcApi } from './types/jsonRpcApi';

type RpcCore = {
    [TMethodName in keyof JsonRpcApi]: (
        transport: IJsonRpcTransport,
        ...params: Parameters<JsonRpcApi[TMethodName]>
    ) => ReturnType<JsonRpcApi[TMethodName]>;
};

export const rpc = /* #__PURE__ */ new Proxy<RpcCore>({} as RpcCore, {
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get<TMethodName extends keyof JsonRpcApi>(target: RpcCore, p: TMethodName) {
        if (target[p] == null) {
            const method = p.toString();
            target[p] = async function (transport, ...params) {
                const normalizedParams = params.length ? params : undefined;
                const result = await transport.send<
                    Parameters<JsonRpcApi[TMethodName]> | undefined,
                    ReturnType<RpcCore[TMethodName]>
                >(method, normalizedParams);
                return result;
            } as RpcCore[TMethodName];
        }
        return target[p];
    },
});
