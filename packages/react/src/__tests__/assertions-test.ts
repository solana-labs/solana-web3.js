import { address } from '@solana/addresses';
import {
    SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE,
    SolanaError,
} from '@solana/errors';

import { assertWalletAccountSupportsFeatures, assertWalletSupportsFeatures } from '../assertions';

describe('assertWalletAccountSupportsFeatures', () => {
    it('does not fatal when a wallet account supports all features', () => {
        const mockAccount = {
            address: address('3kjLdPpu1ayfyxRzGFLX352NfKTFL8b4wb8GA8aFxaR3'),
            features: ['solana:signTransaction', 'solana:signAndSendTransaction', 'solana:signIn'] as const,
        };
        expect(() => {
            assertWalletAccountSupportsFeatures(['solana:signAndSendTransaction', 'solana:signIn'], mockAccount);
        }).not.toThrow();
    });
    it('fatals when a wallet account does not support a feature', () => {
        const mockAccount = {
            address: address('3kjLdPpu1ayfyxRzGFLX352NfKTFL8b4wb8GA8aFxaR3'),
            features: ['solana:signTransaction'] as const,
        };
        expect(() => {
            assertWalletAccountSupportsFeatures(
                ['solana:signTransaction', 'solana:signAndSendTransaction'],
                mockAccount,
            );
        }).toThrow(
            new SolanaError(SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE, {
                accountAddress: mockAccount.address,
                featureNames: ['solana:signAndSendTransaction'],
            }),
        );
    });
});

describe('assertWalletSupportsFeatures', () => {
    it('does not fatal when a wallet supports all features', () => {
        const mockWallet = {
            features: { 'solana:signAndSendTransaction': {}, 'solana:signIn': {}, 'solana:signTransaction': {} },
            name: 'Mock Wallet',
        };
        expect(() => {
            assertWalletSupportsFeatures(['solana:signAndSendTransaction', 'solana:signIn'], mockWallet);
        }).not.toThrow();
    });
    it('fatals when a wallet does not support a feature', () => {
        const mockWallet = {
            features: { 'solana:signTransaction': {} },
            name: 'Mock Wallet',
        };
        expect(() => {
            assertWalletSupportsFeatures(['solana:signTransaction', 'solana:signAndSendTransaction'], mockWallet);
        }).toThrow(
            new SolanaError(SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE, {
                featureNames: ['solana:signAndSendTransaction'],
                walletName: 'Mock Wallet',
            }),
        );
    });
});
