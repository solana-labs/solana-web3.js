import { Dispatcher, fetch as fetchImpl } from 'undici';

import fetch from '../index.node';

jest.mock('undici');

describe('fetch', () => {
    it('should call the underlying `fetch` with the `dispatcher` supplied in `requestInit`', () => {
        const explicitDispatcher = Symbol('explicitDispatcher') as unknown as Dispatcher;
        fetch('http://solana.com', { dispatcher: explicitDispatcher });
        expect(fetchImpl).toHaveBeenCalledWith('http://solana.com', {
            dispatcher: explicitDispatcher,
        });
    });
    it('should call the underlying `fetch` with an undefined `dispatcher` when an undefined is explicitly supplied in `requestInit`', () => {
        fetch('http://solana.com', { dispatcher: undefined });
        expect(fetchImpl).toHaveBeenCalledWith('http://solana.com', {
            dispatcher: undefined,
        });
    });
});
