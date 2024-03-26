import {
    SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE,
    SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE,
    SolanaError,
} from '@solana/errors';
import { SolanaFeatures } from '@solana/wallet-standard-features';
import { Wallet, WalletAccount, WalletWithFeatures } from '@wallet-standard/base';

type AllSolanaWalletFeatures = UnionToIntersection<SolanaFeatures>;

type FilterKeys<V, K> = { [P in keyof V]: P extends K ? P : never }[keyof V];

type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never;

export function assertWalletAccountSupportsFeatures(
    featureNames: (keyof AllSolanaWalletFeatures)[],
    account: Pick<WalletAccount, 'address' | 'features'>,
): void {
    const unsupportedFeatures = featureNames.filter(featureName => !account.features.includes(featureName));
    if (unsupportedFeatures.length) {
        throw new SolanaError(SOLANA_ERROR__WALLET_ACCOUNT_DOES_NOT_SUPPORT_FEATURE, {
            accountAddress: account.address,
            featureNames: unsupportedFeatures,
        });
    }
}

export function assertWalletSupportsFeatures<TFeatureNames extends (keyof AllSolanaWalletFeatures)[]>(
    featureNames: TFeatureNames,
    wallet: Pick<Wallet, 'features' | 'name'>,
): asserts wallet is WalletWithFeatures<{
    [P in FilterKeys<AllSolanaWalletFeatures, TFeatureNames[number]>]: AllSolanaWalletFeatures[P];
}> {
    const unsupportedFeatures = featureNames.filter(featureName => !(featureName in wallet.features));
    if (unsupportedFeatures.length) {
        throw new SolanaError(SOLANA_ERROR__WALLET_DOES_NOT_SUPPORT_FEATURE, {
            featureNames: unsupportedFeatures,
            walletName: wallet.name,
        });
    }
}
