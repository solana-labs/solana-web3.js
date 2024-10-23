import { createRpcSubscriptionsTransportFromChannelCreator } from '../rpc-subscriptions-transport';

describe('createRpcSubscriptionsTransportFromChannelCreator', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it('creates a function that calls `createChannel` with the abort signal', () => {
        const mockCreateChannel = jest.fn();
        const creator = createRpcSubscriptionsTransportFromChannelCreator(mockCreateChannel);
        const abortSignal = new AbortController().signal;
        creator({
            execute: jest.fn(),
            request: { methodName: 'foo', params: [] },
            signal: abortSignal,
        }).catch(() => {});
        expect(mockCreateChannel).toHaveBeenCalledWith({ abortSignal });
    });
    it('creates a function that calls `execute` with the created channel', async () => {
        expect.assertions(1);
        const creator = createRpcSubscriptionsTransportFromChannelCreator(jest.fn().mockResolvedValue('MOCK_CHANNEL'));
        const mockExecute = jest.fn();
        creator({
            execute: mockExecute,
            request: { methodName: 'foo', params: [] },
            signal: new AbortController().signal,
        }).catch(() => {});
        await jest.runAllTimersAsync();
        expect(mockExecute).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: 'MOCK_CHANNEL',
            }),
        );
    });
    it('creates a function that calls `execute` with the abort signal', async () => {
        expect.assertions(1);
        const creator = createRpcSubscriptionsTransportFromChannelCreator(jest.fn());
        const mockExecute = jest.fn();
        const signal = new AbortController().signal;
        creator({
            execute: mockExecute,
            request: { methodName: 'foo', params: [] },
            signal,
        }).catch(() => {});
        await jest.runAllTimersAsync();
        expect(mockExecute).toHaveBeenCalledWith(
            expect.objectContaining({
                signal,
            }),
        );
    });
});
