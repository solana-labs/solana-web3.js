import { address } from '@solana/addresses';
import { SOLANA_ERROR__WALLET__HAS_NO_CONNECTED_ACCOUNTS, SolanaError } from '@solana/errors';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import { Wallet } from '@wallet-standard/base';
import { StandardEvents, StandardEventsListeners } from '@wallet-standard/features';
import { act } from 'react-test-renderer';

import { renderHook } from '../test-renderer';
import { useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT';

describe('useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT', () => {
    let emitWalletChangeEvent: StandardEventsListeners['change'];
    let mockWallet: Wallet;
    let walletEventSubscribers: StandardEventsListeners['change'][];
    beforeEach(() => {
        walletEventSubscribers = [];
        emitWalletChangeEvent = e => {
            walletEventSubscribers.forEach(callback => {
                try {
                    callback(e);
                } catch {
                    /* empty */
                }
            });
        };
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
            features: {
                [StandardEvents]: {
                    on(_: 'change', callback: StandardEventsListeners['change']) {
                        walletEventSubscribers.push(callback);
                    },
                },
            },
            icon: 'data:image/svg+xml;base64,ABC',
            name: 'Mock Wallet',
            version: '1.0.0',
        };
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when a wallet has no accounts (ie. is not connected)', () => {
        const { result } = renderHook(() =>
            useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT({ ...mockWallet, accounts: [] }),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__HAS_NO_CONNECTED_ACCOUNTS, { walletName: 'Mock Wallet' }),
        );
    });
    it('updates when the accounts change', () => {
        const { result } = renderHook(() => useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(mockWallet));
        act(() => {
            emitWalletChangeEvent({
                accounts: [
                    ...mockWallet.accounts,
                    {
                        address: address('38rGc9Ypq1UDbgr2MLebTCYQiFKCyjsS8SF7x25XQFTu'),
                        chains: ['solana:devnet'],
                        features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                        icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                        label: 'Newly Added Account',
                        publicKey: new Uint8Array([
                            31, 186, 37, 242, 101, 43, 37, 145, 54, 90, 167, 143, 185, 160, 74, 109, 72, 162, 24, 240,
                            54, 61, 189, 241, 199, 152, 181, 255, 39, 19, 251, 200,
                        ]),
                    },
                ],
            });
        });
        expect(result.current).toContainEqual(
            expect.objectContaining({ address: '38rGc9Ypq1UDbgr2MLebTCYQiFKCyjsS8SF7x25XQFTu' }),
        );
    });
    it('fatals when the wallet disconnects', () => {
        const { result } = renderHook(() => useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(mockWallet));
        act(() => {
            emitWalletChangeEvent({
                accounts: [],
            });
        });
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__HAS_NO_CONNECTED_ACCOUNTS, { walletName: 'Mock Wallet' }),
        );
    });
});
