import { RpcRequest } from './rpc-request';

let _nextMessageId = 0n;
function getNextMessageId(): string {
    const id = _nextMessageId;
    _nextMessageId++;
    return id.toString();
}

export function createRpcMessage<TParams>(request: RpcRequest<TParams>) {
    return {
        id: getNextMessageId(),
        jsonrpc: '2.0',
        method: request.methodName,
        params: request.params,
    };
}
