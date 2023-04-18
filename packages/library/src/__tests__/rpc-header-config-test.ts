import { createDefaultRpc } from '../rpc';

import { createJsonRpcTransport } from '@solana/rpc-transport';

jest.mock('@solana/rpc-transport');

describe('RPC custom HTTP header config', () => {
    it('adds configured headers to each request with downcased property names', () => {
        createDefaultRpc({
            headers: { aUtHoRiZaTiOn: 'Picard, 4 7 Alpha Tango' },
            url: 'fake://url',
        });
        expect(createJsonRpcTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: 'Picard, 4 7 Alpha Tango',
                }),
            })
        );
    });
    it('adds a `solana-client` header with the current NPM package version by default', () => {
        createDefaultRpc({ url: 'fake://url' });
        expect(createJsonRpcTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            })
        );
    });
    it('makes it impossible to override the `solana-client` header', () => {
        createDefaultRpc({
            headers: { 'sOlAnA-cLiEnT': 'fakeversion' },
            url: 'fake://url',
        });
        expect(createJsonRpcTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            })
        );
        expect(createJsonRpcTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    'sOlAnA-cLiEnT': 'fakeversion',
                }),
            })
        );
    });
});
