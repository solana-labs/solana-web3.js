import { address } from '@solana/addresses';
import { Wallet } from '@wallet-standard/base';

import { renderHook } from '../test-renderer';
import { useWalletAccounts } from '../useWalletAccounts';
import { useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT } from '../useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT';

jest.mock('../useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT');

describe('useWalletAccounts', () => {
    beforeEach(() => {
        jest.mocked(useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT).mockReturnValue([
            {
                address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                chains: ['solana:devnet'],
                features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Test Account',
                publicKey: new Uint8Array([
                    251, 6, 90, 16, 167, 85, 10, 206, 169, 88, 60, 180, 238, 49, 109, 108, 152, 101, 243, 178, 93, 190,
                    195, 73, 206, 97, 76, 131, 200, 38, 175, 179,
                ]),
            },
            {
                address: address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx'),
                chains: ['solana:devnet', 'solana:mainnet', 'solana:testnet'],
                features: ['solana:signMessage', 'solana:signAndSendTransaction'],
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Personal Account',
                publicKey: new Uint8Array([
                    159, 8, 37, 221, 244, 25, 37, 131, 55, 40, 233, 211, 111, 235, 4, 250, 61, 170, 129, 95, 102, 117,
                    14, 137, 115, 154, 196, 5, 68, 224, 212, 45,
                ]),
            },
        ]);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it("returns an array of display details about the wallet's accounts", () => {
        const { result } = renderHook(() => useWalletAccounts([] as unknown as Wallet, 'devnet'));
        expect(result.current).toStrictEqual([
            {
                address: address('Httx5rAMNW3zA6NtXbgpnq22RdS9qK6rRBiNi8Msoc8a'),
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Test Account',
            },
            {
                address: address('Bho2jw9KVthJ4eXHu91gFT4pmTHWBP8kXnB1DkxvB9gx'),
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                label: 'My Personal Account',
            },
        ]);
    });
});
