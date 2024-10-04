type EventMap = Record<string, Event>;
type Listener<TEvent extends Event> = ((evt: TEvent) => void) | { handleEvent(object: TEvent): void };

export interface TypedEventEmitter<TEventMap extends EventMap> {
    addEventListener<const TEventType extends keyof TEventMap>(
        type: TEventType,
        listener: Listener<TEventMap[TEventType]>,
        options?: AddEventListenerOptions | boolean,
    ): void;
    removeEventListener<const TEventType extends keyof TEventMap>(
        type: TEventType,
        listener: Listener<TEventMap[TEventType]>,
        options?: EventListenerOptions | boolean,
    ): void;
}

/**
 * Why not just extend the interface above, rather than to copy/paste it?
 * See https://github.com/microsoft/TypeScript/issues/60008
 */
export interface TypedEventTarget<TEventMap extends EventMap> {
    addEventListener<const TEventType extends keyof TEventMap>(
        type: TEventType,
        listener: Listener<TEventMap[TEventType]>,
        options?: AddEventListenerOptions | boolean,
    ): void;
    dispatchEvent<TEventType extends keyof TEventMap>(ev: TEventMap[TEventType]): void;
    removeEventListener<const TEventType extends keyof TEventMap>(
        type: TEventType,
        listener: Listener<TEventMap[TEventType]>,
        options?: EventListenerOptions | boolean,
    ): void;
}
