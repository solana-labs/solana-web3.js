let _nextMessageId = 0;
function getNextMessageId() {
    const id = _nextMessageId;
    _nextMessageId = (_nextMessageId + 1) % Number.MAX_SAFE_INTEGER;
    return id;
}

export function createRpcMessage<TParams>(method: string, params: TParams) {
    return {
        id: getNextMessageId(),
        jsonrpc: '2.0',
        method,
        params,
    };
}
