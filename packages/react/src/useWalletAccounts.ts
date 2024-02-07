import { Address, address } from '@solana/addresses';
import { SolanaChain } from '@solana/wallet-standard-chains';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { ChainToCluster } from './chain';
import { useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT } from './useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT';

type WalletAccountDetails = Pick<WalletAccount, 'icon' | 'label'> & Readonly<{ address: Address }>;

export function useWalletAccounts<TWallet extends Wallet>(
    wallet: TWallet,
    cluster: ChainToCluster<SolanaChain & TWallet['chains'][number]>,
): readonly WalletAccountDetails[] {
    const accounts = useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, cluster);
    return accounts.map(({ address: rawAddress, icon, label }) => ({
        address: address(rawAddress),
        icon,
        label,
    }));
}
