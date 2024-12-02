import { EventTarget } from '@solana/event-target-impl';

import { DataPublisher, getDataPublisherFromEventEmitter } from '../data-publisher';

describe('a data publisher', () => {
    let dataPublisher: DataPublisher;
    let eventTarget: EventTarget;
    beforeEach(() => {
        eventTarget = new EventTarget();
        dataPublisher = getDataPublisherFromEventEmitter(eventTarget);
    });
    it('calls a subscriber with no arguments when the event is an `Event`', () => {
        const subscriber = jest.fn();
        dataPublisher.on('someEvent', subscriber);
        eventTarget.dispatchEvent(new Event('someEvent'));
        expect(subscriber).toHaveBeenCalledWith();
    });
    it('calls a subscriber with `null` when the event is a `CustomEvent` with no `detail`', () => {
        const subscriber = jest.fn();
        dataPublisher.on('someEvent', subscriber);
        eventTarget.dispatchEvent(new CustomEvent('someEvent'));
        expect(subscriber).toHaveBeenCalledWith(null);
    });
    it('calls a subscriber with the `detail` of a `CustomEvent`', () => {
        const subscriber = jest.fn();
        dataPublisher.on('someEvent', subscriber);
        eventTarget.dispatchEvent(new CustomEvent('someEvent', { detail: 123 }));
        expect(subscriber).toHaveBeenCalledWith(123);
    });
    it('does not call a subscriber after the unsubscribe function is called', () => {
        const subscriber = jest.fn();
        const unsubscribe = dataPublisher.on('someEvent', subscriber);
        unsubscribe();
        eventTarget.dispatchEvent(new Event('someEvent'));
        expect(subscriber).not.toHaveBeenCalled();
    });
    it('does not call a subscriber after its abort signal fires', () => {
        const subscriber = jest.fn();
        const abortController = new AbortController();
        dataPublisher.on('someEvent', subscriber, { signal: abortController.signal });
        abortController.abort();
        eventTarget.dispatchEvent(new Event('someEvent'));
        expect(subscriber).not.toHaveBeenCalled();
    });
    it('does not fatal when the unsubscribe method is called more than once', () => {
        const subscriber = jest.fn();
        const unsubscribe = dataPublisher.on('someEvent', subscriber);
        unsubscribe();
        expect(() => {
            unsubscribe();
        }).not.toThrow();
    });
    it('keeps other subscribers subscribed when unsubcribing from others', () => {
        const subscriberA = jest.fn();
        const subscriberB = jest.fn();
        dataPublisher.on('someEvent', subscriberA);
        const unsubscribeB = dataPublisher.on('someEvent', subscriberB);
        unsubscribeB();
        eventTarget.dispatchEvent(new Event('someEvent'));
        expect(subscriberA).toHaveBeenCalled();
    });
    it('keeps other subscribers subscribed when the abort signal of another fires', () => {
        const subscriberA = jest.fn();
        const subscriberB = jest.fn();
        const abortController = new AbortController();
        dataPublisher.on('someEvent', subscriberA);
        dataPublisher.on('someEvent', subscriberB, { signal: abortController.signal });
        abortController.abort();
        eventTarget.dispatchEvent(new Event('someEvent'));
        expect(subscriberA).toHaveBeenCalled();
    });
    it('does not notify a subscriber about an event with a type different than the one it is interested in', () => {
        const subscriber = jest.fn();
        dataPublisher.on('someEvent', subscriber);
        eventTarget.dispatchEvent(new Event('someOtherEvent'));
        expect(subscriber).not.toHaveBeenCalled();
    });
});
