/* eslint-disable react-hooks/rules-of-hooks */

import { address } from '@solana/addresses';
import { UiWalletAccount } from '@wallet-standard/ui';

import { useSignAndSendTransaction } from '../useSignAndSendTransaction';

const mockWalletAccount = {
    address: address('123'),
    chains: ['solana:danknet', 'bitcoin:mainnet'] as const,
    features: [],
    publicKey: new Uint8Array([1, 2, 3]),
    '~uiWalletHandle': null as unknown as UiWalletAccount['~uiWalletHandle'],
} as const;

// [DESCRIBE] useSignAndSendTransaction.
{
    // It accepts any chain in the solana namespace
    useSignAndSendTransaction(mockWalletAccount, 'solana:danknet');
    useSignAndSendTransaction(mockWalletAccount, 'solana:basednet');

    // It accepts one of the chains actually supported by the wallet account
    useSignAndSendTransaction(mockWalletAccount, 'solana:danknet');

    // It rejects a chain in a non-Solana namespace
    useSignAndSendTransaction(
        mockWalletAccount,
        // @ts-expect-error Non-Solana chain
        'bitcoin:mainnet',
    );
}
