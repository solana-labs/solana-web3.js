import type { Address } from '@solana/addresses';

import type { TokenAmount } from './token-amount';

export type TokenBalance = Readonly<{
    /** Index of the account in which the token balance is provided for. */
    accountIndex: number;
    /** Pubkey of the token's mint. */
    mint: Address;
    /** Pubkey of token balance's owner. */
    owner?: Address;
    /** Pubkey of the Token program that owns the account. */
    programId?: Address;
    uiTokenAmount: TokenAmount;
}>;
