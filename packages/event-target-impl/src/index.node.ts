import { setMaxListeners } from 'node:events';

export const AbortController = class extends globalThis.AbortController {
    constructor(...args: ConstructorParameters<typeof globalThis.AbortController>) {
        super(...args);
        setMaxListeners(Number.MAX_SAFE_INTEGER, this.signal);
    }
};

export const EventTarget = class extends globalThis.EventTarget {
    constructor(...args: ConstructorParameters<typeof globalThis.EventTarget>) {
        super(...args);
        setMaxListeners(Number.MAX_SAFE_INTEGER, this);
    }
};
