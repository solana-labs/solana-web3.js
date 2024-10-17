import { RpcRequest } from './rpc-request';

let _nextMessageId = 0;
function getNextMessageId() {
    const id = _nextMessageId;
    _nextMessageId = (_nextMessageId + 1) % Number.MAX_SAFE_INTEGER;
    return id;
}

export function createRpcMessage<TParams>(request: RpcRequest<TParams>) {
    return {
        id: getNextMessageId(),
        jsonrpc: '2.0',
        method: request.methodName,
        params: request.params,
    };
}
