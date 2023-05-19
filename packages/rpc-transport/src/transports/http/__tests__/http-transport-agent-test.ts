import fetchMock from 'jest-fetch-mock-fork';

import { IRpcTransport } from '../../transport-types';
import { createHttpTransport } from '../http-transport';

describe('createHttpTransport and HTTP agent config', () => {
    let agent: jest.Mock;
    let transport: IRpcTransport;
    beforeEach(() => {
        agent = jest.fn();
        fetchMock.once(JSON.stringify({ ok: true }));
        transport = createHttpTransport({
            httpAgentNodeOnly: agent,
            url: 'fake://url',
        });
    });
    if (__NODEJS__) {
        it('passes the configured agent through to the transport implementation in Node environments', () => {
            transport({ payload: 123 });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    agent,
                })
            );
        });
    } else {
        it('does not pass the configured agent through to the transport implementation in non-Node environments', () => {
            transport({ payload: 123 });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.not.objectContaining({
                    agent,
                })
            );
        });
    }
});
