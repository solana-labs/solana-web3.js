import { Signature } from '@solana/keys';

import { raceStrategies } from '../confirmation-strategy-racer';

const FOREVER_PROMISE = new Promise(() => {
    /* never resolve */
});

describe('raceStrategies', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it('aborts the `AbortController` passed to `getRecentSignatureConfirmationPromise` when finished', async () => {
        expect.assertions(2);
        const getRecentSignatureConfirmationPromise = jest.fn();
        raceStrategies(
            'abc' as Signature,
            {
                commitment: 'finalized',
                getRecentSignatureConfirmationPromise,
            },
            function getSpecificStrategiesForRace() {
                return [];
            },
        );
        expect(getRecentSignatureConfirmationPromise).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: false }) }),
        );
        await jest.runAllTimersAsync();
        expect(getRecentSignatureConfirmationPromise).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: true }) }),
        );
    });
    it('aborts the `AbortController` passed to `getRecentSignatureConfirmationPromise` when the caller-supplied `AbortSignal` aborts', () => {
        const getRecentSignatureConfirmationPromise = jest.fn().mockReturnValue(FOREVER_PROMISE);
        const abortController = new AbortController();
        raceStrategies(
            'abc' as Signature,
            {
                abortSignal: abortController.signal,
                commitment: 'finalized',
                getRecentSignatureConfirmationPromise,
            },
            function getSpecificStrategiesForRace() {
                return [];
            },
        );
        expect(getRecentSignatureConfirmationPromise).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: false }) }),
        );
        abortController.abort();
        expect(getRecentSignatureConfirmationPromise).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: true }) }),
        );
    });
    it('aborts the `AbortController` passed to the specific strategies when finished', async () => {
        expect.assertions(2);
        const getSpecificStrategiesForRace = jest.fn().mockReturnValue([]);
        raceStrategies(
            'abc' as Signature,
            {
                commitment: 'finalized',
                getRecentSignatureConfirmationPromise: jest.fn(),
            },
            getSpecificStrategiesForRace,
        );
        expect(getSpecificStrategiesForRace).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: false }) }),
        );
        await jest.runAllTimersAsync();
        expect(getSpecificStrategiesForRace).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: true }) }),
        );
    });
    it('aborts the `AbortController` passed to the specific strategies when the caller-supplied `AbortSignal` aborts', () => {
        const getSpecificStrategiesForRace = jest.fn().mockReturnValue([]);
        const abortController = new AbortController();
        raceStrategies(
            'abc' as Signature,
            {
                abortSignal: abortController.signal,
                commitment: 'finalized',
                getRecentSignatureConfirmationPromise: jest.fn().mockReturnValue(FOREVER_PROMISE),
            },
            getSpecificStrategiesForRace,
        );
        expect(getSpecificStrategiesForRace).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: false }) }),
        );
        abortController.abort();
        expect(getSpecificStrategiesForRace).toHaveBeenCalledWith(
            expect.objectContaining({ abortSignal: expect.objectContaining({ aborted: true }) }),
        );
    });
});
