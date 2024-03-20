import { Connection } from '../connection.js';

describe('ConnectionSham', () => {
    it.each(['gopher:', 'tel:', 'ws://', 'wss://'])('fatals if the endpoint supplied starts with `%s`', scheme => {
        expect(() => new Connection(scheme + 'url')).toThrow();
    });
    it.each(['https', 'http'])('offers the `%s` endpoint URL through the `rpcEndpoint` property', scheme => {
        const endpoint = scheme + '://url';
        const connection = new Connection(endpoint);
        expect(connection).toHaveProperty('rpcEndpoint', endpoint);
    });
});
