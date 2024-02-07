import { address } from '@solana/addresses';
import { SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import { Wallet } from '@wallet-standard/base';

import { renderHook } from '../test-renderer';
import { useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT';

describe('useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT', () => {
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
                {
                    address: address('6hNHHnX1Mas5TLBZoVm6dcH4oXTemB1Njxr6hiSks8PQ'),
                    chains: ['solana:testnet'],
                    features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                    label: 'My Test Account',
                    publicKey: new Uint8Array([
                        84, 161, 186, 181, 101, 79, 164, 30, 119, 128, 137, 78, 165, 169, 15, 231, 112, 143, 114, 249,
                        10, 66, 139, 186, 56, 119, 12, 205, 158, 28, 106, 111,
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
    it('returns the account matching the given address and cluster', () => {
        const { result } = renderHook(() =>
            useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                'devnet',
            ),
        );
        expect(result.current).toBe(mockWallet.accounts[0]);
    });
    it('fatals when a wallet has no account matching the given address and cluster', () => {
        const { result } = renderHook(() =>
            useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                address('6bDQKLGyVpAUzhZa8jDvKbAPPs33ESMdTAjN4HX5PEVu'),
                'devnet',
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
    it('fatals when a wallet has an account matching the given address but not the cluster', () => {
        const { result } = renderHook(() =>
            useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                address('6bDQKLGyVpAUzhZa8jDvKbAPPs33ESMdTAjN4HX5PEVu'),
                'testnet',
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
