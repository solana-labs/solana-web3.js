import { Address } from '@solana/addresses';
import { SolanaSignMessage, SolanaSignMessageInput, SolanaSignMessageOutput } from '@solana/wallet-standard-features';
import { Wallet } from '@wallet-standard/base';

import { assertWalletAccountSupportsFeatures, assertWalletSupportsFeatures } from './assertions';
import { useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT } from './useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT';

export function useSignMessageFeature<TWallet extends Wallet>(
    wallet: TWallet,
    address: Address,
): (...messages: readonly SolanaSignMessageInput['message'][]) => Promise<readonly SolanaSignMessageOutput[]> {
    assertWalletSupportsFeatures([SolanaSignMessage], wallet);
    const account = useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, address);
    assertWalletAccountSupportsFeatures([SolanaSignMessage], account);
    const { signMessage } = wallet.features[SolanaSignMessage];
    return (...messages) => signMessage(...messages.map(message => ({ account, message })));
}
