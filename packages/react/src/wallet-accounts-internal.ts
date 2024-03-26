import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__CHAIN_NOT_SUPPORTED,
    SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN,
    SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN,
    SolanaError,
} from '@solana/errors';
import { isSolanaChain, SolanaChain } from '@solana/wallet-standard-chains';
import { IdentifierString, Wallet, WalletAccount, WalletWithFeatures } from '@wallet-standard/base';
import { StandardEvents, StandardEventsFeature } from '@wallet-standard/features';
import { useCallback, useRef, useSyncExternalStore } from 'react';

import { ChainToCluster } from './chain';

function getAccountsServerSnapshot() {
    return [];
}

function getSolanaChainFromCluster(cluster: ChainToCluster<SolanaChain>): SolanaChain {
    const chain: IdentifierString = `solana:${cluster === 'mainnet-beta' ? 'mainnet' : cluster}`;
    if (!isSolanaChain(chain)) {
        throw new SolanaError(SOLANA_ERROR__CHAIN_NOT_SUPPORTED, { chain });
    }
    return chain;
}

function hasEventsFeature(wallet: Wallet): wallet is WalletWithFeatures<StandardEventsFeature> {
    return StandardEvents in wallet.features;
}

export function useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
    address: Address,
    cluster: ChainToCluster<TWallet['chains'][number] & SolanaChain>,
): WalletAccount {
    const accounts = useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(wallet, cluster);
    const account = accounts.find(account => account.address === address);
    if (!account) {
        throw new SolanaError(SOLANA_ERROR__WALLET_ACCOUNT_NOT_FOUND_IN_WALLET, {
            accountAddress: address,
            walletName: wallet.name,
        });
    }
    return account;
}

export function useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
    cluster: ChainToCluster<TWallet['chains'][number] & SolanaChain>,
): readonly WalletAccount[] {
    const solanaChain = getSolanaChainFromCluster(cluster);
    if (!wallet.chains.includes(solanaChain)) {
        throw new SolanaError(SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_CHAIN, {
            chain: solanaChain,
            walletName: wallet.name,
        });
    }
    const accountsRef = useRef(wallet.accounts);
    const accounts = useSyncExternalStore(
        /* subscribe */ useCallback(
            onStoreChange => {
                if (!hasEventsFeature(wallet)) {
                    return () => {};
                }
                const unsubscribe = wallet.features[StandardEvents].on('change', ({ accounts }) => {
                    if (accounts) {
                        // The presence of `accounts` among this callback's args implies a change.
                        accountsRef.current = accounts;
                        onStoreChange();
                    }
                });
                return unsubscribe;
            },
            [wallet],
        ),
        /* getSnapshot */ useCallback(() => accountsRef.current, []),
        /* getServerSnapshot */ getAccountsServerSnapshot,
    );
    const accountsForSpecifiedChain = accounts.filter(account => account.chains.includes(solanaChain));
    if (!accountsForSpecifiedChain.length) {
        throw new SolanaError(SOLANA_ERROR__WALLET_HAS_NO_CONNECTED_ACCOUNTS_FOR_CHAIN, {
            chain: solanaChain,
            walletName: wallet.name,
        });
    }
    return accountsForSpecifiedChain;
}
