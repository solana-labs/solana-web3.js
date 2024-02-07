import { address } from '@solana/addresses';
import {
    SOLANA_ERROR__WALLET__CHAIN_UNSUPPORTED,
    SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS_FOR_CHAIN,
    SOLANA_ERROR__WALLET__INVALID_SOLANA_CHAIN,
    SolanaError,
} from '@solana/errors';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { renderHook } from '../test-renderer';
import { useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT';
import { useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT';

jest.mock('../useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT');

describe('useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT', () => {
    let mockWallet: Wallet;
    beforeEach(() => {
        mockWallet = {
            chains: SOLANA_CHAINS,
            name: 'Mock Wallet',
        } as unknown as Wallet;
        jest.mocked(useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT).mockReturnValue([]);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when a wallet has no accounts for the specified chain', () => {
        const { result } = renderHook(() =>
            useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(mockWallet, 'localnet'),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS_FOR_CHAIN, {
                chain: 'solana:localnet',
                walletName: 'Mock Wallet',
            }),
        );
    });
    it('fatals when passed a cluster that results in a chain unsupported by Solana', () => {
        const { result } = renderHook(() =>
            useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(
                mockWallet,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                'cheese-sandwich',
            ),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__INVALID_SOLANA_CHAIN, {
                chain: 'solana:cheese-sandwich',
            }),
        );
    });
    it('fatals when passed a cluster that is not supported by the wallet', () => {
        const { result } = renderHook(() =>
            useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(
                { ...mockWallet, chains: ['solana:mainnet'] },
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                'devnet',
            ),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__CHAIN_UNSUPPORTED, {
                chain: 'solana:devnet',
                walletName: 'Mock Wallet',
            }),
        );
    });
    it.each(['mainnet-beta', 'devnet', 'testnet', 'localnet'] as const)(
        'does not fatal when called with supported cluster `%s`',
        cluster => {
            jest.mocked(useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT).mockReturnValue([
                {
                    address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                    chains: [
                        // eslint-disable-next-line jest/no-conditional-in-test
                        cluster === 'mainnet-beta' ? 'solana:mainnet' : `solana:${cluster}`,
                    ],
                    features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                    label: 'My Test Account',
                    publicKey: new Uint8Array([
                        251, 6, 90, 16, 167, 85, 10, 206, 169, 88, 60, 180, 238, 49, 109, 108, 152, 101, 243, 178, 93,
                        190, 195, 73, 206, 97, 76, 131, 200, 38, 175, 179,
                    ]),
                },
            ]);
            const { result } = renderHook(() =>
                useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(mockWallet, cluster),
            );
            expect(result.__type).not.toBe('error');
        },
    );
    it('returns only accounts that match the supplied chain', () => {
        const mockAccounts = [
            {
                address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                chains: ['solana:mainnet'],
                features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Test Account',
                publicKey: new Uint8Array([
                    251, 6, 90, 16, 167, 85, 10, 206, 169, 88, 60, 180, 238, 49, 109, 108, 152, 101, 243, 178, 93, 190,
                    195, 73, 206, 97, 76, 131, 200, 38, 175, 179,
                ]),
            },
            {
                address: address('6hNHHnX1Mas5TLBZoVm6dcH4oXTemB1Njxr6hiSks8PQ'),
                chains: ['solana:devnet'],
                features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Test Account',
                publicKey: new Uint8Array([
                    84, 161, 186, 181, 101, 79, 164, 30, 119, 128, 137, 78, 165, 169, 15, 231, 112, 143, 114, 249, 10,
                    66, 139, 186, 56, 119, 12, 205, 158, 28, 106, 111,
                ]),
            },
        ] as WalletAccount[];
        jest.mocked(useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT).mockReturnValue(mockAccounts);
        const { result } = renderHook(() =>
            useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(mockWallet, 'mainnet-beta'),
        );
        expect(result.current).toStrictEqual([mockAccounts[0]]);
    });
});
