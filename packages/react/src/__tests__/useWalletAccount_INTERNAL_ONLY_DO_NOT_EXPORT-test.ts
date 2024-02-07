import { address } from '@solana/addresses';
import { SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import { Wallet } from '@wallet-standard/base';

import { renderHook } from '../test-renderer';
import { useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT';

describe('useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT', () => {
    let mockWallet: Wallet;
    beforeEach(() => {
        mockWallet = {
            accounts: [
                {
                    address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                    chains: ['solana:devnet'],
                    features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                    label: 'My Test Account',
                    publicKey: new Uint8Array([
                        251, 6, 90, 16, 167, 85, 10, 206, 169, 88, 60, 180, 238, 49, 109, 108, 152, 101, 243, 178, 93,
                        190, 195, 73, 206, 97, 76, 131, 200, 38, 175, 179,
                    ]),
                },
            ],
            chains: SOLANA_CHAINS,
            features: {},
            icon: 'data:image/svg+xml;base64,ABC',
            name: 'Mock Wallet',
            version: '1.0.0',
        };
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('returns the account matching the given address', () => {
        const { result } = renderHook(() =>
            useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
            ),
        );
        expect(result.current).toBe(mockWallet.accounts[0]);
    });
    it('fatals when a wallet has no account matching the given address', () => {
        const { result } = renderHook(() =>
            useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                address('6bDQKLGyVpAUzhZa8jDvKbAPPs33ESMdTAjN4HX5PEVu'),
            ),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, {
                accountAddress: '6bDQKLGyVpAUzhZa8jDvKbAPPs33ESMdTAjN4HX5PEVu',
                walletName: 'Mock Wallet',
            }),
        );
    });
});
