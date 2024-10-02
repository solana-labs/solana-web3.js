import { TypedEventEmitter } from './event-emitter';

type UnsubscribeFn = () => void;

export interface DataPublisher<TDataByChannelName extends Record<string, unknown> = Record<string, unknown>> {
    on<const TChannelName extends keyof TDataByChannelName>(
        channelName: TChannelName,
        subscriber: (
            ...data: TDataByChannelName[TChannelName] extends never ? [] : [data: TDataByChannelName[TChannelName]]
        ) => void,
        options?: { signal: AbortSignal },
    ): UnsubscribeFn;
}

export function getDataPublisherFromEventEmitter<TEventMap extends Record<string, Event>>(
    eventEmitter: TypedEventEmitter<TEventMap>,
): DataPublisher<{
    [TEventType in keyof TEventMap]: TEventMap[TEventType] extends CustomEvent
        ? TEventMap[TEventType]['detail']
        : never;
}> {
    return {
        on(channelName, subscriber, options) {
            function innerListener(ev: Event) {
                if (ev instanceof CustomEvent) {
                    const data = (ev as CustomEvent<TEventMap[typeof channelName]>).detail;
                    (subscriber as unknown as (data: TEventMap[typeof channelName]) => void)(data);
                } else {
                    (subscriber as () => void)();
                }
            }
            eventEmitter.addEventListener(channelName, innerListener, options);
            return () => {
                eventEmitter.removeEventListener(channelName, innerListener);
            };
        },
    };
}
