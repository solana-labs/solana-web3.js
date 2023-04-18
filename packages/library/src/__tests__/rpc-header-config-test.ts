import { createDefaultRpc } from '../rpc';

import fetchMock from 'jest-fetch-mock-fork';

const FAKE_URL = 'fake://url';

describe('RPC custom HTTP header config', () => {
    let transport: ReturnType<typeof createDefaultRpc>;
    beforeEach(() => {
        transport = createDefaultRpc({
            headers: {
                aUtHoRiZaTiOn: 'Picard, 4 7 Alpha Tango',
                'sOlAnA-cLiEnT': 'fakeversion',
            },
            url: FAKE_URL,
        });
        fetchMock.mockReturnValue(
            new Promise(() => {
                /* never resolve */
            })
        );
        transport.getBlockHeight().send();
    });
    it('adds configured headers to each request with downcased property names', () => {
        expect(fetchMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: 'Picard, 4 7 Alpha Tango',
                }),
            })
        );
    });
    it('adds a `solana-client` header with the current NPM package version', () => {
        expect(fetchMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            })
        );
    });
    it('makes it impossible to override the `solana-client` header', () => {
        expect(fetchMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            })
        );
        expect(fetchMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    'sOlAnA-cLiEnT': 'fakeversion',
                }),
            })
        );
    });
});
