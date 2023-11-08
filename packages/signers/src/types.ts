import { Address } from '@solana/addresses';
import { SignatureBytes } from '@solana/keys';

export type SignatureDictionary = Record<Address, SignatureBytes>;
