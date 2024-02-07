import { Address } from '@solana/addresses';
import { SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import { SolanaChain } from '@solana/wallet-standard-chains';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { ChainToCluster } from './chain';
import { useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT } from './useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT';

export function useWalletAccountForCluster_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
    address: Address,
    cluster: ChainToCluster<SolanaChain & TWallet['chains'][number]>,
): WalletAccount {
    const accounts = useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, cluster);
    const account = accounts.find(account => account.address === address);
    if (!account) {
        throw new SolanaError(SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, {
            accountAddress: address,
            walletName: wallet.name,
        });
    }
    return account;
}
