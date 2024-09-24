import { demultiplexDataPublisher } from '../rpc-subscriptions-pubsub-demultiplex';

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
    it('calls the transform function for every event that matches the source channel name', () => {
        const mockMessageTransformer = jest.fn().mockReturnValue([]);
        demultiplexDataPublisher(mockDataPublisher, 'channelName', mockMessageTransformer);
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
