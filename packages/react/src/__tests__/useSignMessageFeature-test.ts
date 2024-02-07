import { address } from '@solana/addresses';
import {
    SOLANA_ERROR__WALLET__ACCOUNT_FEATURE_UNSUPPORTED,
    SOLANA_ERROR__WALLET__FEATURE_UNSUPPORTED,
    SolanaError,
} from '@solana/errors';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import { SolanaSignMessage } from '@solana/wallet-standard-features';
import { Wallet } from '@wallet-standard/base';

import { renderHook } from '../test-renderer';
import { useSignMessageFeature } from '../useSignMessageFeature';

describe('useSignMessageFeature', () => {
    let mockSignMessage: jest.Mock;
    let mockWallet: Wallet;
    beforeEach(() => {
        mockSignMessage = jest.fn();
        mockWallet = {
            accounts: [
                {
                    address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                    chains: ['solana:devnet'],
                    features: [],
                    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                    label: 'My Test Account',
                    publicKey: new Uint8Array([
                        251, 6, 90, 16, 167, 85, 10, 206, 169, 88, 60, 180, 238, 49, 109, 108, 152, 101, 243, 178, 93,
                        190, 195, 73, 206, 97, 76, 131, 200, 38, 175, 179,
                    ]),
                },
                {
                    address: address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx'),
                    chains: ['solana:devnet', 'solana:mainnet', 'solana:localnet', 'solana:testnet'],
                    features: ['solana:signMessage'],
                    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                    label: 'My Personal Account',
                    publicKey: new Uint8Array([
                        159, 8, 37, 221, 244, 25, 37, 131, 55, 40, 233, 211, 111, 235, 4, 250, 61, 170, 129, 95, 102,
                        117, 14, 137, 115, 154, 196, 5, 68, 224, 212, 45,
                    ]),
                },
            ],
            chains: SOLANA_CHAINS,
            features: {
                [SolanaSignMessage]: {
                    signMessage: mockSignMessage,
                    version: '1.1.0',
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
    it("returns a function that proxies calls to the wallet's `signMessage` function", () => {
        const { result } = renderHook(() =>
            useSignMessageFeature(mockWallet, address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx')),
        );
        expect(result.__type).toBe('result');
        const signMessages = result.current as NonNullable<Extract<typeof result, { __type: 'result' }>['current']>;
        const messageA = new Uint8Array([1, 2, 3]);
        const messageB = new Uint8Array([4, 5, 6]);
        signMessages(messageA, messageB);
        expect(mockSignMessage).toHaveBeenCalledWith(
            { account: mockWallet.accounts[1], message: messageA },
            { account: mockWallet.accounts[1], message: messageB },
        );
    });
    it("returns a function that returns the result of the wallet's `signMessage` function", async () => {
        expect.assertions(2);
        const mockSignMessageResult = [new Uint8Array([100, 100, 100])] as readonly Uint8Array[];
        mockSignMessage.mockResolvedValue(mockSignMessageResult);
        const { result } = renderHook(() =>
            useSignMessageFeature(mockWallet, address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx')),
        );
        expect(result.__type).toBe('result');
        const signMessages = result.current as NonNullable<Extract<typeof result, { __type: 'result' }>['current']>;
        await expect(signMessages(new Uint8Array([1, 2, 3]))).resolves.toBe(mockSignMessageResult);
    });
    it('fatals when passed a wallet that does not support the `SolanaSignMessage` feature', () => {
        const { result } = renderHook(() =>
            useSignMessageFeature(
                { ...mockWallet, features: {} },
                address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx'),
            ),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__FEATURE_UNSUPPORTED, {
                featureNames: [SolanaSignMessage],
                walletName: mockWallet.name,
            }),
        );
    });
    it('fatals when passed an address of an account that does not support the `SolanaSignMessage` feature', () => {
        const { result } = renderHook(() =>
            useSignMessageFeature(mockWallet, address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a')),
        );
        expect(result.__type).toBe('error');
        expect(result.current).toEqual(
            new SolanaError(SOLANA_ERROR__WALLET__ACCOUNT_FEATURE_UNSUPPORTED, {
                accountAddress: 'Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a',
                featureNames: [SolanaSignMessage],
            }),
        );
    });
});
