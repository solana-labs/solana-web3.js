let _nextMessageId = 0;
export function getNextMessageId() {
    const id = _nextMessageId;
    _nextMessageId = (_nextMessageId + 1) % Number.MAX_SAFE_INTEGER;
    return id;
}
