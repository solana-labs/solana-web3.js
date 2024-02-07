import {
    SOLANA_ERROR__WALLET__CHAIN_UNSUPPORTED,
    SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS_FOR_CHAIN,
    SolanaError,
} from '@solana/errors';
import { SolanaChain } from '@solana/wallet-standard-chains';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { ChainToCluster, getSolanaChainFromCluster } from './chain';
import { useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT } from './useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT';

export function useWalletAccountsForCluster_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
    cluster: ChainToCluster<SolanaChain & TWallet['chains'][number]>,
): readonly WalletAccount[] {
    const solanaChain = getSolanaChainFromCluster(cluster);
    if (!wallet.chains.includes(solanaChain)) {
        throw new SolanaError(SOLANA_ERROR__WALLET__CHAIN_UNSUPPORTED, {
            chain: solanaChain,
            walletName: wallet.name,
        });
    }
    const accounts = useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(wallet);
    const accountsForSpecifiedChain = accounts.filter(account => account.chains.includes(solanaChain));
    if (!accountsForSpecifiedChain.length) {
        throw new SolanaError(SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS_FOR_CHAIN, {
            chain: solanaChain,
            walletName: wallet.name,
        });
    }
    return accountsForSpecifiedChain;
}
