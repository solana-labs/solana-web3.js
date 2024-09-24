import { DataPublisher, getDataPublisherFromEventEmitter } from '@solana/subscribable';

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
    const eventTarget = new EventTarget();
    publisher.on(sourceChannelName, sourceMessage => {
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
    const demultiplexdDataPublisher = getDataPublisherFromEventEmitter(eventTarget);
    return demultiplexdDataPublisher;
}
