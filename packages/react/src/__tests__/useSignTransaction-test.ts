import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED,
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWalletAccount } from '@wallet-standard/ui';
import {
    getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';

import { renderHook } from '../test-renderer';
import { useSignTransaction } from '../useSignTransaction';

jest.mock('@wallet-standard/ui-registry');

describe('useSignTransaction', () => {
    let mockSignTransaction: jest.Mock;
    let mockUiWalletAccount: {
        address: 'abc';
        chains: ['solana:danknet'];
        features: ['solana:signTransaction'];
        publicKey: Uint8Array;
        '~uiWalletHandle': UiWalletAccount['~uiWalletHandle'];
    };
    let mockWalletAccount: WalletAccount;
    beforeEach(() => {
        mockSignTransaction = jest.fn().mockResolvedValue([{ signature: 'abc' }]);
        mockUiWalletAccount = {
            address: 'abc',
            chains: ['solana:danknet'] as const,
            features: ['solana:signTransaction'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        mockWalletAccount = {
            address: 'abc',
            chains: ['solana:danknet'] as const,
            features: ['solana:signTransaction'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
        };
        const mockWallet: Wallet = {
            accounts: [mockWalletAccount],
            chains: ['solana:danknet'] as const,
            features: {
                ['solana:signTransaction']: {
                    signTransaction: mockSignTransaction,
                },
            },
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock Wallet',
            version: '1.0.0' as WalletVersion,
        };
        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
        jest.mocked(getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(
            mockWalletAccount,
        );
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('fatals when passed a wallet account that does not support the `solana:signTransaction` feature', () => {
        const { result } = renderHook(() =>
            useSignTransaction({ ...mockUiWalletAccount, features: ['other:feature'] }, 'solana:danknet'),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED, {
                address: 'abc',
                featureName: 'solana:signTransaction',
                supportedChains: ['solana:danknet'],
                supportedFeatures: ['other:feature'],
            }),
        );
    });
    it('fatals when passed a wallet account that does not support the specified chain', () => {
        const { result } = renderHook(() =>
            useSignTransaction({ ...mockUiWalletAccount, chains: ['solana:basednet'] }, 'solana:danknet'),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED, {
                address: 'abc',
                chain: 'solana:danknet',
                featureName: 'solana:signTransaction',
                supportedChains: ['solana:basednet'],
                supportedFeatures: ['solana:signTransaction'],
            }),
        );
    });
    it('fatals when the wallet account lookup for the supplied React wallet account fails', () => {
        jest.mocked(getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockImplementation(() => {
            throw 'o no';
        });
        const { result } = renderHook(() => useSignTransaction(mockUiWalletAccount, 'solana:danknet'));
        expect(result.__type).toBe('error');
        expect(result.current).toBe('o no');
    });
    describe('the function returned', () => {
        it("calls the wallet's `signTransaction` implementation", async () => {
            expect.assertions(2);
            const { result } = renderHook(() => useSignTransaction(mockUiWalletAccount, 'solana:danknet'));
            // eslint-disable-next-line jest/no-conditional-in-test
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const signTransaction = result.current;
                signTransaction({
                    options: { minContextSlot: 123n },
                    transaction: new Uint8Array([1, 2, 3]),
                }).catch(() => {});
                await jest.runAllTimersAsync();
                signTransaction({
                    options: { minContextSlot: 123n },
                    transaction: new Uint8Array([1, 2, 3]),
                }).catch(() => {});
                // eslint-disable-next-line jest/no-conditional-expect
                expect(mockSignTransaction).toHaveBeenCalledTimes(2);
                // eslint-disable-next-line jest/no-conditional-expect
                expect(mockSignTransaction).toHaveBeenCalledWith({
                    account: mockWalletAccount,
                    chain: 'solana:danknet',
                    options: { minContextSlot: 123 },
                    transaction: new Uint8Array([1, 2, 3]),
                });
            }
        });
    });
});
