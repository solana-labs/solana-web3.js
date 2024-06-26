import { Address } from '@solana/addresses';
import { SignatureBytes } from '@solana/keys';
import { Slot } from '@solana/rpc-types';

export type SignatureDictionary = Readonly<Record<Address, SignatureBytes>>;

export type BaseSignerConfig = Readonly<{
    abortSignal?: AbortSignal;
}>;

export interface BaseTransactionSignerConfig extends BaseSignerConfig {
    // Signers that simulate transactions (eg. wallets) might be interested in knowing which slot
    // was current when the transaction was prepared. They can use this information to ensure that
    // they don't run the simulation at too early a slot.
    minContextSlot?: Slot;
}
