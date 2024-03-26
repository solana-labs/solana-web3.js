import {
    SolanaSignAndSendTransaction,
    SolanaSignAndSendTransactionFeature,
    SolanaSignIn,
    SolanaSignInFeature,
    SolanaSignMessage,
    SolanaSignMessageFeature,
    SolanaSignTransaction,
    SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import { Wallet } from '@wallet-standard/base';

import { assertWalletSupportsFeatures } from '../assertions';

const wallet = null as unknown as Wallet;

assertWalletSupportsFeatures([SolanaSignMessage], wallet);
assertWalletSupportsFeatures([SolanaSignIn], wallet);
wallet.features satisfies SolanaSignMessageFeature;
wallet.features satisfies SolanaSignInFeature;

// @ts-expect-error Not one of the features asserted on
wallet.features satisfies SolanaSignTransactionFeature;

// @ts-expect-error Not one of the features asserted on
wallet.features satisfies SolanaSignAndSendTransactionFeature;

assertWalletSupportsFeatures([SolanaSignTransaction, SolanaSignAndSendTransaction], wallet);
wallet.features satisfies SolanaSignTransactionFeature;
wallet.features satisfies SolanaSignAndSendTransactionFeature;
