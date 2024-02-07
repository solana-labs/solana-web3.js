import { SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS, SolanaError } from '@solana/errors';
import { Wallet, WalletAccount, WalletWithFeatures } from '@wallet-standard/base';
import { StandardEvents, StandardEventsFeature } from '@wallet-standard/features';
import { useCallback, useRef, useSyncExternalStore } from 'react';

function getAccountsServerSnapshot() {
    return [];
}

function hasEventsFeature(wallet: Wallet): wallet is WalletWithFeatures<StandardEventsFeature> {
    return StandardEvents in wallet.features;
}

export function useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
): readonly WalletAccount[] {
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
    if (!accounts.length) {
        throw new SolanaError(SOLANA_ERROR__WALLET__EXPECTED_CONNECTED_ACCOUNTS, {
            walletName: wallet.name,
        });
    }
    return accounts;
}
