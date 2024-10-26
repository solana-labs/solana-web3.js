import { SolanaSignInInput } from '@solana/wallet-standard-features';
import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED,
    WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import {
    getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';

import { renderHook } from '../test-renderer';
import { useSignIn } from '../useSignIn';

jest.mock('@wallet-standard/ui-registry');

describe('useSignIn', () => {
    let mockSignIn: jest.Mock;
    let mockUiWallet: UiWallet;
    let mockUiWalletAccount: {
        address: 'abc';
        chains: [];
        features: ['solana:signIn'];
        publicKey: Uint8Array;
        '~uiWalletHandle': UiWalletAccount['~uiWalletHandle'];
    };
    let mockWallet: Wallet;
    let mockWalletAccount: WalletAccount;
    beforeEach(() => {
        mockSignIn = jest.fn().mockResolvedValue([{ signature: 'abc' }]);
        mockUiWalletAccount = {
            address: 'abc',
            chains: [] as const,
            features: ['solana:signIn'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        mockUiWallet = {
            accounts: [mockUiWalletAccount] as const,
            chains: [] as const,
            features: ['solana:signIn'] as const,
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock Wallet',
            version: '1.0.0' as WalletVersion,
            '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
        };
        mockWalletAccount = {
            address: 'abc',
            chains: [] as const,
            features: ['solana:signIn'] as const,
            publicKey: new Uint8Array([1, 2, 3]),
        };
        mockWallet = {
            accounts: [mockWalletAccount],
            chains: [],
            features: {
                ['solana:signIn']: {
                    signIn: mockSignIn,
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
    it('fatals when passed a wallet that does not support the `solana:signIn` feature', () => {
        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue({
            ...mockWallet,
            features: { ['other:feature']: {} },
        });
        const { result } = renderHook(() => useSignIn(mockUiWallet));
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED, {
                featureName: 'solana:signIn',
                supportedChains: [],
                supportedFeatures: ['other:feature'],
                walletName: 'Mock Wallet',
            }),
        );
    });
    it('fatals when passed a wallet account that does not support the `solana:signIn` feature', () => {
        const { result } = renderHook(() => useSignIn({ ...mockUiWalletAccount, features: ['other:feature'] }));
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED, {
                address: 'abc',
                featureName: 'solana:signIn',
                supportedChains: [],
                supportedFeatures: ['other:feature'],
            }),
        );
    });
    it('fatals when the wallet account lookup for the supplied React wallet account fails', () => {
        jest.mocked(getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockImplementation(() => {
            throw 'o no';
        });
        const { result } = renderHook(() => useSignIn(mockUiWalletAccount));
        expect(result.__type).toBe('error');
        expect(result.current).toBe('o no');
    });
    describe('when configured with a `UiWallet`', () => {
        let signIn: ReturnType<typeof useSignIn>;
        beforeEach(() => {
            const { result } = renderHook(() => useSignIn(mockUiWallet));

            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                signIn = result.current;
            }
        });
        describe('the function returned', () => {
            it("calls the wallet's `signIn` implementation", async () => {
                expect.assertions(2);
                signIn({ statement: 'You will really like being signed in' }).catch(() => {});
                await jest.runAllTimersAsync();
                signIn({ statement: 'You will really like being signed in' }).catch(() => {});

                expect(mockSignIn).toHaveBeenCalledTimes(2);

                expect(mockSignIn).toHaveBeenCalledWith({
                    statement: 'You will really like being signed in',
                });
            });
        });
    });
    describe('when configured with a `UiWalletAccount`', () => {
        let signIn: (input?: Omit<SolanaSignInInput, 'address'>) => Promise<{
            readonly account: WalletAccount;
            readonly signature: Uint8Array;
            readonly signedMessage: Uint8Array;
        }>;
        beforeEach(() => {
            const { result } = renderHook(() => useSignIn(mockUiWalletAccount));

            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                signIn = result.current;
            }
        });
        describe('the function returned', () => {
            it("calls the wallet's `signIn` implementation", async () => {
                expect.assertions(2);
                signIn({ statement: 'You will really like being signed in' }).catch(() => {});
                await jest.runAllTimersAsync();
                signIn({ statement: 'You will really like being signed in' }).catch(() => {});

                expect(mockSignIn).toHaveBeenCalledTimes(2);

                expect(mockSignIn).toHaveBeenCalledWith({
                    address: 'abc',
                    statement: 'You will really like being signed in',
                });
            });
            it('overrides any supplied `address` input with the address of the account', () => {
                signIn({
                    // @ts-expect-error Not allowed by TypeScript, but what if supplied anyway?
                    address: '123',
                }).catch(() => {});

                expect(mockSignIn).toHaveBeenCalledWith({ address: 'abc' });
            });
        });
    });
});
