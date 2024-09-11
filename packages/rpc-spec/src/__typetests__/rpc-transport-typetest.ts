import { isJsonRpcPayload } from '../rpc-transport';

{
    // [isJsonRpcPayload]: It narrows the type of the payload to a JSON RPC payload.
    const payload = {} as unknown;
    if (isJsonRpcPayload(payload)) {
        payload satisfies { jsonrpc: '2.0'; method: string; params: unknown };
    }
}
