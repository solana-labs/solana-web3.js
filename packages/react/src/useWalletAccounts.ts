import { Address, address } from '@solana/addresses';
import { SolanaChain } from '@solana/wallet-standard-chains';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { ChainToCluster } from './chain';
import { useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT } from './wallet-accounts-internal';

type WalletAccountDetails = Pick<WalletAccount, 'icon' | 'label'> & Readonly<{ address: Address }>;

export function useWalletAccounts<TWallet extends Wallet>(
    wallet: TWallet,
    cluster: ChainToCluster<TWallet['chains'][number] & SolanaChain>,
): readonly WalletAccountDetails[] {
    const accounts = useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, cluster);
    return accounts.map(({ address: rawAddress, icon, label }) => ({
        address: address(rawAddress),
        icon,
        label,
    }));
}
