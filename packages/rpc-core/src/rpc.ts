import { IJsonRpcTransport } from '@solana/rpc-transport';
import { JsonRpcApi } from './types/jsonRpcApi';

export const rpc = /* #__PURE__ */ new Proxy<JsonRpcApi>({} as JsonRpcApi, {
    defineProperty() {
        return false;
    },
    deleteProperty() {
        return false;
    },
    get<TMethodName extends keyof JsonRpcApi>(target: JsonRpcApi, p: TMethodName) {
        if (target[p] == null) {
            const method = p.toString();
            target[p] = async function (transport: IJsonRpcTransport, ...params: Parameters<JsonRpcApi[TMethodName]>) {
                const normalizedParams = params.length ? params : undefined;
                const result = await transport.send(method, normalizedParams);
                return result;
            } as unknown as JsonRpcApi[TMethodName];
        }
        return target[p];
    },
});
