/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/rules-of-hooks */

import { address } from '@solana/addresses';
import { WalletVersion } from '@wallet-standard/base';
import { UiWalletAccount } from '@wallet-standard/ui';

import { useSignIn } from '../useSignIn';

const mockWalletAccount = {
    address: address('123'),
    chains: ['solana:danknet', 'bitcoin:mainnet'] as const,
    features: [],
    publicKey: new Uint8Array([1, 2, 3]),
    '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
} as const;

const mockWallet = {
    accounts: [mockWalletAccount],
    chains: ['solana:danknet', 'bitcoin:mainnet'] as const,
    features: [],
    icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
    name: 'Mock Wallet',
    version: '1.0.0' as WalletVersion,
    '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
} as const;

// [DESCRIBE] The function returned from `useSignIn`
{
    // [DESCRIBE] When created with a wallet
    {
        const signIn = useSignIn(mockWallet);

        // It accepts no config
        {
            signIn();
        }

        // It accepts an address config
        {
            signIn({ address: address('abc') });
        }
    }

    // [DESCRIBE] When created with a wallet account
    {
        const signIn = useSignIn(mockWalletAccount);

        // It accepts no config
        {
            signIn();
        }

        // It does not accept an address config
        {
            signIn({
                // @ts-expect-error Address is already provided by the wallet
                address: address('abc'),
            });
        }
    }
}
