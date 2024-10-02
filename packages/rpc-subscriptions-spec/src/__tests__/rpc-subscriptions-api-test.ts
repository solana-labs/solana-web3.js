import { createRpcSubscriptionsApi } from '../rpc-subscriptions-api';
import { RpcSubscriptionsChannel } from '../rpc-subscriptions-channel';

describe('createRpcSubscriptionsApi', () => {
    let mockChannel: RpcSubscriptionsChannel<unknown, unknown>;
    beforeEach(() => {
        mockChannel = { on: jest.fn(), send: jest.fn() };
    });
    describe('executeSubscriptionPlan', () => {
        it('calls the plan executor with the expected params', () => {
            const mockPlanExecutor = jest.fn();
            const api = createRpcSubscriptionsApi({ planExecutor: mockPlanExecutor });
            const expectedParams = [1, 'hi', 3];
            const expectedSignal = new AbortController().signal;
            api.foo(...expectedParams).executeSubscriptionPlan({
                channel: mockChannel,
                signal: expectedSignal,
            });
            expect(mockPlanExecutor).toHaveBeenCalledWith({
                channel: mockChannel,
                notificationName: 'foo',
                params: expectedParams,
                signal: expectedSignal,
            });
        });
    });
    describe('subscriptionConfigurationHash', () => {
        it('does not call the hash creator before it is accessed', () => {
            const mockGetSubscriptionConfigurationHash = jest.fn();
            const api = createRpcSubscriptionsApi({
                getSubscriptionConfigurationHash: mockGetSubscriptionConfigurationHash,
                planExecutor: jest.fn(),
            });
            api.foo('hi');
            expect(mockGetSubscriptionConfigurationHash).not.toHaveBeenCalled();
        });
        it('calls the hash creator when it is accessed', () => {
            const mockGetSubscriptionConfigurationHash = jest.fn();
            const api = createRpcSubscriptionsApi({
                getSubscriptionConfigurationHash: mockGetSubscriptionConfigurationHash,
                planExecutor: jest.fn(),
            });
            const result = api.foo('hi');
            result.subscriptionConfigurationHash;
            expect(mockGetSubscriptionConfigurationHash).toHaveBeenCalledWith({
                notificationName: 'foo',
                params: ['hi'],
            });
        });
        it('memoizes the result of the hash creator', () => {
            const mockGetSubscriptionConfigurationHash = jest.fn();
            const api = createRpcSubscriptionsApi({
                getSubscriptionConfigurationHash: mockGetSubscriptionConfigurationHash,
                planExecutor: jest.fn(),
            });
            const result = api.foo('hi');
            result.subscriptionConfigurationHash;
            result.subscriptionConfigurationHash;
            expect(mockGetSubscriptionConfigurationHash).toHaveBeenCalledTimes(1);
        });
        it('returns the result of the hash creator', () => {
            const mockGetSubscriptionConfigurationHash = jest.fn().mockReturnValue('MOCK_HASH');
            const api = createRpcSubscriptionsApi({
                getSubscriptionConfigurationHash: mockGetSubscriptionConfigurationHash,
                planExecutor: jest.fn(),
            });
            const result = api.foo('hi');
            expect(result.subscriptionConfigurationHash).toBe('MOCK_HASH');
        });
    });
});
