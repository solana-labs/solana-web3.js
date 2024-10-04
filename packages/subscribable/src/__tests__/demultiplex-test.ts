import { demultiplexDataPublisher } from '../demultiplex';

describe('demultiplexDataPublisher', () => {
    let mockDataPublisher: { on: jest.Mock };
    function publishMessage(channelName: string, message: unknown) {
        mockDataPublisher.on.mock.calls
            .filter(([actualChannelName]) => actualChannelName === channelName)
            .forEach(([_, listener]) => listener(message));
    }
    beforeEach(() => {
        mockDataPublisher = {
            on: jest.fn(),
        };
    });
    it('does not listen to the publisher when there are no subscribers', () => {
        demultiplexDataPublisher(mockDataPublisher, 'channelName', jest.fn() /* messageTransformer */);
        expect(mockDataPublisher.on).not.toHaveBeenCalled();
    });
    it('starts to listen to the publisher when a subscriber appears', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        demuxedDataPublisher.on('someChannelName', () => {});
        expect(mockDataPublisher.on).toHaveBeenCalledTimes(1);
    });
    it('only listens to the publisher once despite multiple subscriptions', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        demuxedDataPublisher.on('someChannelName', () => {});
        demuxedDataPublisher.on('someOtherChannelName', () => {});
        expect(mockDataPublisher.on).toHaveBeenCalledTimes(1);
    });
    it('unsubscribes from the publisher once the last subscriber unsubscribes', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const unsubscribe = demuxedDataPublisher.on('someChannelName', () => {});
        unsubscribe();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
    it('does not unsubscribe from the publisher if there are still subscribers after some having unsubscribed', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const unsubscribe = demuxedDataPublisher.on('someChannelName', () => {});
        demuxedDataPublisher.on('someChannelName', () => {});
        unsubscribe();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
    it("does not unsubscribe from the publisher when one subscriber's unsubscribe function is called as many times as there are subscriptions", () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const unsubscribeA = demuxedDataPublisher.on('someChannelName', () => {});
        demuxedDataPublisher.on('someOtherChannelName', () => {});
        // No matter how many times the unsubscribe function is called, it only decrements the
        // subscriber count once, for its own subscription.
        unsubscribeA();
        unsubscribeA();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
    it('unsubscribes from the publisher once the last subscriber aborts', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const abortController = new AbortController();
        demuxedDataPublisher.on('someChannelName', () => {}, { signal: abortController.signal });
        abortController.abort();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
    it('does not unsubscribe from the publisher if there are still subscribers after some having aborted', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const abortController = new AbortController();
        demuxedDataPublisher.on('someChannelName', () => {}, { signal: abortController.signal });
        demuxedDataPublisher.on('someChannelName', () => {});
        abortController.abort();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
    it("does not unsubscribe from the publisher when one subscriber's abort signal is fired as many times as there are subscriptions", () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const abortController = new AbortController();
        demuxedDataPublisher.on('someChannelName', () => {}, { signal: abortController.signal });
        demuxedDataPublisher.on('someOtherChannelName', () => {});
        // No matter how many times the abort signal is fired, it only decrements the subscriber
        // count once, for its own subscription.
        abortController.abort();
        abortController.abort();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
    it("does not unsubscribe from the publisher when one subscriber's unsubscribe function is called and its abort signal fires for a total of as many cancellations as there are subscriptions", () => {
        const demuxedDataPublisher = demultiplexDataPublisher(
            mockDataPublisher,
            'channelName',
            jest.fn() /* messageTransformer */,
        );
        const mockUnsubscribe = jest.fn();
        mockDataPublisher.on.mockReturnValue(mockUnsubscribe);
        const abortControllerA = new AbortController();
        const unsubscribeA = demuxedDataPublisher.on('someChannelName', () => {}, { signal: abortControllerA.signal });
        demuxedDataPublisher.on('someOtherChannelName', () => {});
        // No matter how many times the unsubscribe function is called, it only decrements the
        // subscriber count once, for its own subscription.
        unsubscribeA();
        abortControllerA.abort();
        expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
    it('does not call the transform function when there are no subscribers yet', () => {
        const mockMessageTransformer = jest.fn().mockReturnValue([]);
        demultiplexDataPublisher(mockDataPublisher, 'channelName', mockMessageTransformer);
        publishMessage('channelName', 'hi');
        expect(mockMessageTransformer).not.toHaveBeenCalled();
    });
    it('calls the transform function for every event that matches the source channel name when there is at least one subscriber', () => {
        const mockMessageTransformer = jest.fn().mockReturnValue([]);
        const demuxedDataPublisher = demultiplexDataPublisher(mockDataPublisher, 'channelName', mockMessageTransformer);
        demuxedDataPublisher.on('channelName', () => {});
        publishMessage('channelName', 'hi');
        expect(mockMessageTransformer).toHaveBeenCalledWith('hi');
    });
    it('does not call the transform function when the event does not match the source channel name', () => {
        const mockMessageTransformer = jest.fn().mockReturnValue([]);
        demultiplexDataPublisher(mockDataPublisher, 'channelName', mockMessageTransformer);
        publishMessage('otherChannelName', 'o no');
        expect(mockMessageTransformer).not.toHaveBeenCalled();
    });
    it('publishes a message on the demuxed channel with the name returned by the transformer', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(mockDataPublisher, 'channelName', () => [
            'transformedChannelName',
            'HI',
        ]);
        const transformedChannelListener = jest.fn();
        demuxedDataPublisher.on('transformedChannelName', transformedChannelListener);
        publishMessage('channelName', 'hi');
        expect(transformedChannelListener).toHaveBeenCalledWith('HI');
    });
    it('publishes no message on the demuxed channel if the transformer returns `undefined`', () => {
        const demuxedDataPublisher = demultiplexDataPublisher(mockDataPublisher, 'channelName', () => {});
        const transformedChannelListener = jest.fn();
        demuxedDataPublisher.on('transformedChannelName', transformedChannelListener);
        publishMessage('channelName', 'hi');
        expect(transformedChannelListener).not.toHaveBeenCalled();
    });
});
