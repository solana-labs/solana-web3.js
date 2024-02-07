import { Address } from '@solana/addresses';
import { SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, SolanaError } from '@solana/errors';
import { Wallet, WalletAccount } from '@wallet-standard/base';

import { useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT } from './useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT';

export function useWalletAccount_INTERNAL_ONLY_DO_NOT_EXPORT<TWallet extends Wallet>(
    wallet: TWallet,
    address: Address,
): WalletAccount {
    const accounts = useWalletAccounts_INTERNAL_ONLY_DO_NOT_EXPORT(wallet);
    const account = accounts.find(account => account.address === address);
    if (!account) {
        throw new SolanaError(SOLANA_ERROR__WALLET__ACCOUNT_NOT_FOUND, {
            accountAddress: address,
            walletName: wallet.name,
        });
    }
    return account;
}
