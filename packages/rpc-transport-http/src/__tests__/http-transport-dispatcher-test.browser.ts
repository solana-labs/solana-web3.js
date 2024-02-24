import type { Dispatcher } from 'undici';

const WARNING_MESSAGE =
    'You have supplied a `Dispatcher` to `createHttpTransport()`. It has been ignored because ' +
    'Undici dispatchers only work in Node environments. To eliminate this warning, omit the ' +
    '`dispatcher_NODE_ONLY` property from your config when running in a non-Node environment.';

describe('createHttpTransport()', () => {
    let createHttpTransport: typeof import('../http-transport').createHttpTransport;
    beforeEach(async () => {
        jest.spyOn(console, 'warn').mockImplementation();
        await jest.isolateModulesAsync(async () => {
            createHttpTransport =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (await import('../http-transport')).createHttpTransport;
        });
    });
    describe('in development mode', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = true;
        });
        it('warns when configured with a dispatcher', () => {
            createHttpTransport({ dispatcher_NODE_ONLY: {} as Dispatcher, url: 'fake://url' });
            expect(console.warn).toHaveBeenCalledWith(WARNING_MESSAGE);
        });
        it('warns when configured with an undefined dispatcher', () => {
            createHttpTransport({ dispatcher_NODE_ONLY: undefined, url: 'fake://url' });
            expect(console.warn).toHaveBeenCalledWith(WARNING_MESSAGE);
        });
        it('only warns once no matter how many times it is configured with a dispatcher', () => {
            createHttpTransport({ dispatcher_NODE_ONLY: undefined, url: 'fake://url' });
            createHttpTransport({ dispatcher_NODE_ONLY: {} as Dispatcher, url: 'fake://url' });
            createHttpTransport({ dispatcher_NODE_ONLY: null as unknown as Dispatcher, url: 'fake://url' });
            expect(console.warn).toHaveBeenCalledTimes(1);
        });
    });
    describe('in production mode', () => {
        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).__DEV__ = false;
        });
        it('does not warn when configured with a dispatcher', () => {
            createHttpTransport({ dispatcher_NODE_ONLY: {} as Dispatcher, url: 'fake://url' });
            expect(console.warn).not.toHaveBeenCalledWith(WARNING_MESSAGE);
        });
        it('does not warn when configured with an undefined dispatcher', () => {
            createHttpTransport({ dispatcher_NODE_ONLY: undefined, url: 'fake://url' });
            expect(console.warn).not.toHaveBeenCalledWith(WARNING_MESSAGE);
        });
    });
});
