import { getNextMessageId } from './json-rpc-message-id.js';

export function createJsonRpcMessage<TParams>(method: string, params: TParams) {
    return {
        id: getNextMessageId(),
        jsonrpc: '2.0',
        method,
        params,
    };
}
