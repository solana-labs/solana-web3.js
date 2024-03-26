import { Address } from '@solana/addresses';
import { SolanaChain } from '@solana/wallet-standard-chains';
import { SolanaSignMessage, SolanaSignMessageInput, SolanaSignMessageOutput } from '@solana/wallet-standard-features';
import { Wallet } from '@wallet-standard/base';

import { assertWalletAccountSupportsFeatures, assertWalletSupportsFeatures } from './assertions';
import { ChainToCluster } from './chain';
import { useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT } from './wallet-accounts-internal';

export function useSignMessageFeature<TWallet extends Wallet>(
    wallet: TWallet,
    address: Address,
    cluster: ChainToCluster<TWallet['chains'][number] & SolanaChain>,
): (...messages: readonly SolanaSignMessageInput['message'][]) => Promise<readonly SolanaSignMessageOutput[]> {
    assertWalletSupportsFeatures([SolanaSignMessage], wallet);
    const account = useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, address, cluster);
    assertWalletAccountSupportsFeatures([SolanaSignMessage], account);
    const { signMessage } = wallet.features[SolanaSignMessage];
    return (...messages) => signMessage(...messages.map(message => ({ account, message })));
}
