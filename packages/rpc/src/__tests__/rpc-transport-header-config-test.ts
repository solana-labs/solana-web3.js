import { createHttpTransportForSolanaRpc } from '@solana/rpc-transport-http';

import { createDefaultRpcTransport } from '../rpc-transport';

jest.mock('@solana/rpc-transport-http');

describe('createDefaultRpcTransport', () => {
    if (__NODEJS__) {
        it('adds default compression headers', () => {
            createDefaultRpcTransport({ url: 'fake://url' });
            expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'accept-encoding': 'br,gzip,deflate',
                    }),
                }),
            );
        });
        it('allows the override of the default compression headers', () => {
            createDefaultRpcTransport({
                headers: { 'aCcEpT-eNcOdInG': 'zstd' },
                url: 'fake://url',
            });
            expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'accept-encoding': 'zstd',
                    }),
                }),
            );
        });
    }
    it('adds configured headers to each request with downcased property names', () => {
        createDefaultRpcTransport({
            headers: { aUtHoRiZaTiOn: 'Picard, 4 7 Alpha Tango' },
            url: 'fake://url',
        });
        expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: 'Picard, 4 7 Alpha Tango',
                }),
            }),
        );
    });
    it('adds a `solana-client` header with the current NPM package version by default', () => {
        createDefaultRpcTransport({ url: 'fake://url' });
        expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
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
        expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.objectContaining({
                    // Version is defined in `setup-define-version-constant.ts`
                    'solana-client': `js/0.0.0-test`,
                }),
            }),
        );
        expect(createHttpTransportForSolanaRpc).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    'sOlAnA-cLiEnT': 'fakeversion',
                }),
            }),
        );
    });
});
