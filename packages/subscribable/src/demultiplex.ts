import { EventTarget } from '@solana/event-target-impl';

import { DataPublisher, getDataPublisherFromEventEmitter } from './data-publisher';

export function demultiplexDataPublisher<
    TDataPublisher extends DataPublisher,
    const TChannelName extends Parameters<TDataPublisher['on']>[0],
>(
    publisher: TDataPublisher,
    sourceChannelName: TChannelName,
    messageTransformer: (
        // FIXME: Deriving the type of the message from `TDataPublisher` and `TChannelName` would
        //        help callers to constrain their transform functions.
        message: unknown,
    ) => [destinationChannelName: string, message: unknown] | void,
): DataPublisher {
    let innerPublisherState:
        | {
              readonly dispose: () => void;
              numSubscribers: number;
          }
        | undefined;
    const eventTarget = new EventTarget();
    const demultiplexedDataPublisher = getDataPublisherFromEventEmitter(eventTarget);
    return {
        ...demultiplexedDataPublisher,
        on(channelName, subscriber, options) {
            if (!innerPublisherState) {
                const innerPublisherUnsubscribe = publisher.on(sourceChannelName, sourceMessage => {
                    const transformResult = messageTransformer(sourceMessage);
                    if (!transformResult) {
                        return;
                    }
                    const [destinationChannelName, message] = transformResult;
                    eventTarget.dispatchEvent(
                        new CustomEvent(destinationChannelName, {
                            detail: message,
                        }),
                    );
                });
                innerPublisherState = {
                    dispose: innerPublisherUnsubscribe,
                    numSubscribers: 0,
                };
            }
            innerPublisherState.numSubscribers++;
            const unsubscribe = demultiplexedDataPublisher.on(channelName, subscriber, options);
            let isActive = true;
            function handleUnsubscribe() {
                if (!isActive) {
                    return;
                }
                isActive = false;
                options?.signal.removeEventListener('abort', handleUnsubscribe);
                innerPublisherState!.numSubscribers--;
                if (innerPublisherState!.numSubscribers === 0) {
                    innerPublisherState!.dispose();
                    innerPublisherState = undefined;
                }
                unsubscribe();
            }
            options?.signal.addEventListener('abort', handleUnsubscribe);
            return handleUnsubscribe;
        },
    };
}
