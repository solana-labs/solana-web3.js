import { createHttpTransport } from '@solana/rpc-transport-http';

import { createDefaultRpcTransport } from '../rpc-transport';

jest.mock('@solana/rpc-transport-http');

describe('createDefaultRpcTransport', () => {
    it('adds configured headers to each request with downcased property names', () => {
        createDefaultRpcTransport({
            headers: { aUtHoRiZaTiOn: 'Picard, 4 7 Alpha Tango' },
            url: 'fake://url',
        });
        expect(createHttpTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: 'Picard, 4 7 Alpha Tango',
                }),
            }),
        );
    });
    it('adds a `solana-client` header with the current NPM package version by default', () => {
        createDefaultRpcTransport({ url: 'fake://url' });
        expect(createHttpTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            }),
        );
    });
    it('makes it impossible to override the `solana-client` header', () => {
        createDefaultRpcTransport({
            headers: { 'sOlAnA-cLiEnT': 'fakeversion' },
            url: 'fake://url',
        });
        expect(createHttpTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            }),
        );
        expect(createHttpTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    'sOlAnA-cLiEnT': 'fakeversion',
                }),
            }),
        );
    });
});
