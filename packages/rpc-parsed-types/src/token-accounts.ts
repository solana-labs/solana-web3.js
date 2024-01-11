import type { Address } from '@solana/addresses';
import type { TokenAmount } from '@solana/rpc-types';

type TokenAccountState = 'initialized' | 'uninitialized' | 'frozen';

export type TokenAccount = Readonly<{
    mint: Address;
    owner: Address;
    tokenAmount: TokenAmount;
    delegate?: Address;
    state: TokenAccountState;
    isNative: boolean;
    rentExemptReserve?: TokenAmount;
    delegatedAmount?: TokenAmount;
    closeAuthority?: Address;
    extensions?: unknown[];
}>;
