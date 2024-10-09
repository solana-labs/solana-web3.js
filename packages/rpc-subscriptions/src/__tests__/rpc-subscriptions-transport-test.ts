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
            executeSubscriptionPlan: jest.fn(),
            signal: abortSignal,
            subscriptionConfigurationHash: undefined,
        });
        expect(mockCreateChannel).toHaveBeenCalledWith({ abortSignal });
    });
    it('creates a function that calls `executeSubscriptionPlan` with the created channel', async () => {
        expect.assertions(1);
        const creator = createRpcSubscriptionsTransportFromChannelCreator(jest.fn().mockResolvedValue('MOCK_CHANNEL'));
        const mockExecuteSubscriptionPlan = jest.fn();
        creator({
            executeSubscriptionPlan: mockExecuteSubscriptionPlan,
            signal: new AbortController().signal,
            subscriptionConfigurationHash: undefined,
        });
        await jest.runAllTimersAsync();
        expect(mockExecuteSubscriptionPlan).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: 'MOCK_CHANNEL',
            }),
        );
    });
    it('creates a function that calls `executeSubscriptionPlan` with the abort signal', async () => {
        expect.assertions(1);
        const creator = createRpcSubscriptionsTransportFromChannelCreator(jest.fn());
        const mockExecuteSubscriptionPlan = jest.fn();
        const signal = new AbortController().signal;
        creator({
            executeSubscriptionPlan: mockExecuteSubscriptionPlan,
            signal,
            subscriptionConfigurationHash: undefined,
        });
        await jest.runAllTimersAsync();
        expect(mockExecuteSubscriptionPlan).toHaveBeenCalledWith(
            expect.objectContaining({
                signal,
            }),
        );
    });
});
