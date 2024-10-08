import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWalletAccount } from '@wallet-standard/ui';
import {
    getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';

import { renderHook } from '../test-renderer';
import { useSignMessage } from '../useSignMessage';

jest.mock('@wallet-standard/ui-registry');

describe('useSignMessage', () => {
    let mockSignMessage: jest.Mock;
    let mockUiWalletAccount: UiWalletAccount;
    let mockWalletAccount: WalletAccount;
    beforeEach(() => {
        mockSignMessage = jest.fn().mockResolvedValue([{ signature: 'abc' }]);
        mockUiWalletAccount = {
            address: 'abc',
            chains: ['solana:danknet'] as const,
            features: ['solana:signMessage'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        mockWalletAccount = {
            address: 'abc',
            chains: ['solana:danknet'] as const,
            features: ['solana:signMessage'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
        };
        const mockWallet: Wallet = {
            accounts: [mockWalletAccount],
            chains: ['solana:danknet'],
            features: {
                ['solana:signMessage']: {
                    signMessage: mockSignMessage,
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
    it('fatals when passed a wallet account that does not support the `solana:signMessage` feature', () => {
        const { result } = renderHook(() => useSignMessage({ ...mockUiWalletAccount, features: ['other:feature'] }));
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED, {
                address: 'abc',
                featureName: 'solana:signMessage',
                supportedChains: ['solana:danknet'],
                supportedFeatures: ['other:feature'],
            }),
        );
    });
    it('fatals when the wallet account lookup for the supplied React wallet account fails', () => {
        jest.mocked(getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockImplementation(() => {
            throw 'o no';
        });
        const { result } = renderHook(() => useSignMessage(mockUiWalletAccount));
        expect(result.__type).toBe('error');
        expect(result.current).toBe('o no');
    });
    describe('the function returned', () => {
        it("calls the wallet's `signMessage` implementation", async () => {
            expect.assertions(2);
            const { result } = renderHook(() => useSignMessage(mockUiWalletAccount));
            // eslint-disable-next-line jest/no-conditional-in-test
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const signMessage = result.current;
                signMessage({ message: new Uint8Array([1, 2, 3]) }).catch(() => {});
                await jest.runAllTimersAsync();
                signMessage({ message: new Uint8Array([1, 2, 3]) }).catch(() => {});
                // eslint-disable-next-line jest/no-conditional-expect
                expect(mockSignMessage).toHaveBeenCalledTimes(2);
                // eslint-disable-next-line jest/no-conditional-expect
                expect(mockSignMessage).toHaveBeenCalledWith({
                    account: mockWalletAccount,
                    message: new Uint8Array([1, 2, 3]),
                });
            }
        });
    });
});
