import { Address } from '@solana/addresses';

export type AddressesByLookupTableAddress = { [lookupTableAddress: Address]: Address[] };
